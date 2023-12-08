// In der Datei "cockpit.htm" die Zeile mit dem Tag für die Tabelle finden und > id="cockpit" < einfügen.


// Import dependencies
const fs = require("fs");
const file_to_parse = fs.readFileSync('cockpit.htm', 'utf8').toString();
var cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");

let row_content = new Array();
let file_content = "";
file_content =  cheerio.load(file_to_parse);
cheerioTableparser(file_content);
const table = file_content("body > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1)").parsetable();
// const table = file_content("table#cockpit").parsetable();
const str_title = file_content('title').html();                                     // Titel der Seite auslesen
const column_count = table.length;                                                  // Anzahl der Spalten
const row_count = table[0].length;                                                  // Anzahl der Reihen


function read_row(rowNumber) {
  for(let column_index = 0; column_index < column_count; column_index++) {
    row_content.push(table[column_index][rowNumber]);
  }
  return row_content;
}


// Neue HTML-Datei aufbauen
let new_html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>` + str_title + `</title>
  <script type="text/javascript" src="sorttable.js"></script>
  <!-- https://www.kryogenix.org/code/browser/sorttable/ -->
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <table class="Kopfzeile">
    <tr>
      <td>
        <span class="Kopftext"> ` + str_title + ` </span>
      </td>
    </tr>
  </table>

  <h3>Aufträge mit Inbetriebnahme -4/+8W</h3>
  <div class="tableFixHead">
    <table id="cockpit" class="sortable fixed_header" border="1" cellspacing="0">
      <thead class="fixedHeader" align="left">
        <tr>\n`
read_row(0);
for (i = 0; i < column_count; i++) {
  if (row_content[i] == "ANr.") {
    new_html = new_html + `          <th class="sortable_numeric">` + row_content[i] + `</th>\n`;
  } else if (row_content[i] == "Datum IBN") {
    new_html = new_html + `          <th class="sorttable_ddmm">` + row_content[i] + `</th>\n`;
  } else {
    new_html = new_html + `          <th>` + row_content[i] + `</th>\n`;
  }
}
new_html = new_html +`        </tr>
      </thead>
      <tbody class="scrollContent">\n`;

for (let row_index = 1; row_index < row_count; row_index++) {                       // Reihe 0 bis 43
  row_content = [];
  read_row(row_index);
  new_html = new_html +`        <tr>\n`;
  for ( let column_index = 0; column_index < column_count; column_index++) {        // Spalte 0 bis 6
    // wenn der Text "IBN durch BDI" enthalten ist, dann den td-Tag mit der Klasse "mark" verwenden.
    if (row_content[column_index].includes("IBN durch BDI")) {
      new_html = new_html + `          <td class="mark">` + row_content[column_index] + `</td>\n`;
    } else { 
      new_html = new_html + `          <td>` + row_content[column_index] + `</td>\n`;
    }
  }
  new_html = new_html +`        </tr>\n`;
}

let html_end = `      </tbody>
    </table>
  </div>
  <br />
  <script>
    var table = document.getElementById("cockpit");
    var cells = table.getElementsById("td");

    console.log(cells);
  </script>
</body>

</html>
`;

// Neue HTML-Seite zusammensetzen
new_html = new_html + html_end;

new_html = new_html.replaceAll(" (Big Dutchman International GmbH)", "");
new_html = new_html.replaceAll(" (Big Dutchman Service GmbH)", "");
// new_html = new_html.replaceAll("Heinz Henkenborg", "Schahin Sattari-Nadjafabadi");

// console.log(new_html);

// Neue HTML-Seite abspeichern
const writeStream = fs.writeFileSync('newCockpit.html', new_html);
