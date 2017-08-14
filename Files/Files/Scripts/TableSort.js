if (Object.freeze == undefined) { }
else {
    var SortDirections = Object.freeze({ Ascending: 1, Unsorted: 0, Descending: -1 });

    var Table = new (function () {
        var table = null;
        Object.defineProperty(this, "Table", {
            get: function () { return table; },
            set: function (value) {
                if (value == null || !value.nodeName || (value.nodeName.toLowerCase() === "table") == false)
                    throw new TableSortException("Invalid argument, invalid table supplied.");

                table = value;
                prepTable();
            }
        });

        Object.defineProperty(this, "Body", {
            get: function () { return table.tBodies[0]; }
        });

        Object.defineProperty(this, "Head", {
            get: function () { return table.tHead; }
        });

        Object.defineProperty(this, "Headers", {
            get: function () { return table.tHead.rows[0].cells; }
        });

        Object.defineProperty(this, "Rows", {
            get: function () { return table.tBodies[0].rows; }
        });

        this.ReplaceBody = function (body) { table.replaceChild(body, this.Body); }

        function addTableSections() {
            var body = document.createElement("tbody");
            var head = document.createElement("thead");
            var rows = table.querySelectorAll("tr");

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.querySelectorAll("th").length > 0) {
                    head.appendChild(row);
                } else {
                    body.appendChild(row);
                }
            }

            table.appendChild(head);
            table.appendChild(body);
        }

        function prepTable() {
            if (table.querySelector("thead") == null || table.querySelector("tbody") == null) {
                removeTableSections(table);
                addTableSections(table);
            }
        }

        function removeTableSections() {
            for (var nodeNames = ["THEAD", "TBODY"], nodeName = nodeNames.length; nodeName--;) {
                for (var nodes = table.querySelectorAll(nodeNames[nodeName]), node = nodes.length; node--;) {
                    var rows = nodes[node].querySelectorAll("tr");
                    for (var row = 0; row < rows.length; row++)
                        table.appendChild(rows[row]);

                    nodes[node].parentNode.removeChild(nodes[node]);
                }
            }
        }
    });
    Object.seal(Table);

    var Properties = new (function () {
        var columnIndex = new Number(0);
        Object.defineProperty(this, "ColumnIndex", {
            get: function () { return columnIndex; },
            set: function (value) { columnIndex = value; }
        });

        var sortDirection = new Number(SortDirections.Unsorted);
        Object.defineProperty(this, "SortDirection", {
            get: function () {
                if (sortDirection < -1 || sortDirection > 1)
                    return SortDirections.Unsorted;

                return sortDirection;
            },
            set: function (value) {
                if (value < -1 || value > 1)
                    throw new TableSortException("Invalid Argument, invalid SortDirections supplied.");

                sortDirection = value;
            }
        });
    });
    Object.seal(Properties);

    function ClearSortFlags(header) {
        for (var headers = Table.Headers, i = headers.length; i--;) {
            if (headers[i] != header)
                headers[i].setAttribute("data-sort-direction", SortDirections.Unsorted);
        }
    }

    function GetNewBody() {
        var newBody = document.createElement("tbody");
        for (var rows = GetNewRows(), i = rows.length; i--;)
            newBody.appendChild(rows[i]);

        return newBody;
    }

    function GetNewRows() {
        var rowArray = new Array();
        for (var rows = Table.Rows, r = rows.length; r--;)
            rowArray.push(rows[r]);

        SortRows(rowArray);
        return rowArray;
    }

    // Initialize table.
    function MakeTableSortable(table) {
        Table.Table = table;
        for (var cells = Table.Headers, i = cells.length; i--;) {
            cells[i].setAttribute("data-sort-direction", SortDirections.Unsorted);
            cells[i].onclick = function () { SortRowsByColumn(this.cellIndex); };
            cells[i].appendChild(document.createElement("span"));
        }
    }

    // Click event.
    function SortRowsByColumn(index) {
        Properties.ColumnIndex = index;
        SetSortDirection();

        var body = GetNewBody();
        Table.ReplaceBody(body);
    }

    function SetSortDirection() {
        var cell = Table.Headers[Properties.ColumnIndex];
        ClearSortFlags(cell);

        if (cell.getAttribute("data-sort-direction") == SortDirections.Ascending)
            cell.setAttribute("data-sort-direction", SortDirections.Descending);
        else
            cell.setAttribute("data-sort-direction", SortDirections.Ascending);

        Properties.SortDirection = cell.getAttribute("data-sort-direction");
    }

    function SortRows(rowArray) {
        rowArray.sort(function (a, b) {
            a = a.cells[Properties.ColumnIndex].innerText;
            b = b.cells[Properties.ColumnIndex].innerText;

            if (a === b)
                return 0;

            return a < b ? Properties.SortDirection : Properties.SortDirection * -1;
        });
    }

    function TableSortException(message) {
        this.Message = message;
        this.Name = "TableSortException";
    }
}