
    var file;

    var text = "";
    var row_del = "\n";
    var col_del = ",";
    var row_del_out = "\n";
    var col_del_out = ",";

    var contents = [];

    var num_cols;
    var num_rows;

    var intervalId;

    var selected = "";

    const LETTERS = "abcdefghijklmnopqrstuvwxyz";

    function has_selection() {
      return selected != "" && selected != "-";
    }

    function get_letter(n) {
      n += 1;
      var s = "";
      do {
        s = LETTERS[(n - 1) % 26] + s;
        n = Math.floor((n - 1) / 26);
      } while (n > 0);
      return s;
    }

    function get_number(letters) {
      if (letters.length == 1) {
        return LETTERS.indexOf(letters) + 1;
      }
      return get_number(letters.slice(letters.length - 1)) + 26 * get_number(letters.slice(0, letters.length - 1));
    }

    function onChooseFile(event) {
      if (typeof window.FileReader !== 'function')
        throw ("The file API isn't supported on this browser.");
      let input = event.target;
      if (!input)
        throw ("The browser does not properly implement the event object");
      if (!input.files)
        throw ("This browser does not support the `files` property of the file input.");
      if (!input.files[0])
        return undefined;
      file = input.files[0];
    }

    function load() {
      var fr = new FileReader();
      fr.onload = function(e) {
        text = e.target.result;
        split_text_to_contents();
        contents_to_display();
        disable_buttons(false, false);
      }
      fr.readAsText(file);
    }

    function split_text_to_contents() {
      if (text != "") {
        var rows = text.split(row_del);
        contents = [];
        num_cols = 0;
        for (var i in rows) {
          if (rows[i] != "") {
            var row = rows[i].split(col_del);
            contents.push(row);
            if (row.length > num_cols) {
              num_cols = row.length;
            }
          }
        }
        num_rows = contents.length;
        for (var i in contents) {
          var row = contents[i];
          while (row.length < num_cols) {
            row.push("");
          }
        }
      }
    }

    function create_td(id) {
      var td = document.createElement("td");
      var input = document.createElement('input');
      input.classList.add('square');
      input.setAttribute('id', id);
      td.appendChild(input);
      td.onclick = select_cell;
      return td;
    }

    function create_th(id, text) {
      var th = document.createElement("th");
      th.setAttribute('id', id);
      th.classList.add('header');
      th.onclick = select_cell;
      th.innerText = text;
      return th;
    }

    function create_row(row_num, length) {
      var tr = document.createElement('tr');
      tr.appendChild(create_th(row_num, row_num));
      for (var c = 0; c < length; c++) {
        tr.appendChild(create_td(row_num + "-" + get_letter(c)));
      }
      return tr;
    }

    function contents_to_display() {
      var table = document.getElementById('contents');
      while (table.firstChild) {
        table.removeChild(table.lastChild);
      }
      var head = document.createElement('tr');
      head.appendChild(create_th("-", ""));
      for (var c = 0; c < contents[0].length; c++) {
        head.appendChild(create_th(get_letter(c), get_letter(c)));
      }
      table.appendChild(head);
      for (var r = 0; r < contents.length; r++) {
        var tr = create_row(r + 1, contents[0].length);
        for (var c = 0; c < contents[r].length; c++) {
          tr.childNodes[c + 1].firstChild.value = contents[r][c];
        }
        table.appendChild(tr);
      }
      clearInterval(intervalId);
      intervalId = setInterval(display_to_contents, 100);
    }

    function display_to_contents() {
      contents = [];
      var table = document.getElementById("contents");
      var rows = table.childNodes;
      for (var r = 1; r < rows.length; r++) {
        var content_row = [];
        var trs = rows[r].childNodes;
        for (var c = 1; c < trs.length; c++) {
          content_row.push(trs[c].firstChild.value);
        }
        contents.push(content_row);
      }
    }

    function disable_buttons(bool1, bool2) {
      document.getElementById('delete').disabled = bool1;
      document.getElementById('insert').disabled = bool2;
    }

    function deselect() {
      var selected_elements = document.getElementsByClassName("selected");
      while (selected_elements.length > 0) {
        selected_elements = document.getElementsByClassName("selected");
        selected_elements[0].classList.remove("selected");
      }
      selected = "";
      disable_buttons(true, true);
    }

    function select_cell(e) {
      // remove selected from all cells
      deselect();
      // get current clicked cell and add .selected
      selected = e.srcElement.getAttribute("id");
      if (!selected.includes("-") && has_selection()) {
        document.getElementById(selected).classList.add("selected");
        // highlight row or column
        var squares = document.getElementsByTagName('td');
        for (var i = 0; i < squares.length; i++) {
          if (squares[i].firstChild.getAttribute("id").split("-").includes(selected)) {
            squares[i].classList.add("selected");
          }
        }
        disable_buttons(isNaN(selected) ? contents[0].length == 1 : contents.length == 1, false);
      }
    }

    function delete_selected() {
      if (has_selection()) {
        if (isNaN(selected)) {
          if (contents[0].length > 1) {
            delete_column(get_number(selected));
          }
        } else {
          if (contents.length > 1) {
            delete_row(Number(selected));
          }
        }
      }
      // deselect();
    }

    function delete_column(col) {
      var table = document.getElementById("contents");
      var rows = table.childNodes;
      rows[0].removeChild(rows[0].lastChild);
      for (var r = 1; r < rows.length; r++) {
        var trs = rows[r].childNodes;
        for (var c = col; c < trs.length - 1; c++) {
          trs[c].firstChild.value = trs[c + 1].firstChild.value;
        }
        rows[r].removeChild(rows[r].lastChild);
      }
    }

    function delete_row(row) {
      var table = document.getElementById("contents");
      var rows = table.childNodes;
      for (var r = row; r < rows.length - 1; r++) {
        var trs1 = rows[r].childNodes;
        var trs2 = rows[r + 1].childNodes;
        for (var c = 0; c < trs1.length; c++) {
          trs1[c].firstChild.value = trs2[c].firstChild.value;
        }
      }
      table.removeChild(table.lastChild);
    }

    function insert_selected() {
      if (has_selection()) {
        if (isNaN(selected)) {
          insert_column(get_number(selected));
        } else {
          insert_row(selected);
        }
      }
    }

    function insert_row(row) {
      var table = document.getElementById("contents");
      var blank = create_row(contents.length + 1, contents[0].length);
      table.appendChild(blank);
      var rows = table.childNodes;
      var trs1, trs2;
      for (var r = rows.length - 1; r > row; r--) {
        trs1 = rows[r - 1].childNodes;
        trs2 = rows[r].childNodes;
        for (var c = 0; c < trs1.length; c++) {
          trs2[c].firstChild.value = trs1[c].firstChild.value;
        }
      }
      var trs = table.childNodes[row].childNodes;
      for (var c = 0; c < trs.length; c++) {
        trs[c].firstChild.value = "";
      }
    }

    function insert_column(col) {
      var table = document.getElementById("contents");
      var rows = table.childNodes;
      var th = create_th(get_letter(rows[0].childNodes.length - 1), get_letter(rows[0].childNodes.length - 1));
      rows[0].appendChild(th);
      for (var r = 1; r < rows.length; r++) {
        var trs = rows[r].childNodes;
        rows[r].appendChild(create_td(r + "-" + get_letter(trs.length - 1)));
        for (var c = trs.length - 1; c > col; c--) {
          trs[c].firstChild.value = trs[c - 1].firstChild.value;
        }
        trs[col].firstChild.value = "";
      }
    }

    function export_to_all() {
      if (contents.length > 0) {
        document.getElementById('export-markdown').innerHTML = get_markdown();
      }
    }

    function format_string_left(content, total, fill) {
      var out = String(content);
      for (var s = 0; s < total - content.length; s++) {
        out += fill;
      }
      return out;
    }

    function get_markdown() {
      var col_widths = [];
      for (var c = 0; c < contents[0].length; c++) {
        col_widths[c] = 0;
      }
      for (var r = 0; r < contents.length; r++) {
        for (var c = 0; c < contents[r].length; c++) {
          if (contents[r][c].length > col_widths[c]) {
            col_widths[c] = contents[r][c].length;
          }
        }
      }
      var md = "|";
      for (var c = 0; c < contents[0].length; c++) {
        md += " " + format_string_left(contents[0][c], col_widths[c], " ") + " |";
      }
      md += "\n|";
      for (var c = 0; c < contents[0].length; c++) {
        md += ":" + format_string_left("", col_widths[c], "-") + ":|";
      }
      for (var r = 1; r < contents.length; r++) {
        md += "\n|";
        for (var c = 0; c < contents[r].length; c++) {
          md += " " + format_string_left(contents[r][c], col_widths[c], " ") + " |"
        }
      }
      return md;
    }


    function SaveAsFile(t,f,m) {
      try {
          var b = new Blob([t],{type:m});
          saveAs(b, f);
      } catch (e) {
          window.open("data:"+m+"," + encodeURIComponent(t), '_blank','');
      }
    }

    function save_to_file() {
      var t = "";
      for (var r = 0; r < contents.length; r++) {
        for (var c = 0; c < contents[0].length; c++) {
          t += contents[r][c];
          if (c != contents[0].length - 1) {
            t += col_del_out;
          }
        }
        t += row_del_out;
      }
      SaveAsFile(t, file.name, "text/plain;charset=utf-8");
    }
