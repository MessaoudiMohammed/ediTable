//************************************************************************//
//                        Editable.js v0.0.5 (beta)                       //
//                         Date Release:04/12/2019                        //
//                     Developed By:Mohammed Messaoudi                    //
//                 https://github.com/OxiGen1001/ediTable/                //
//************************************************************************//


// NOTE: this is a new version if you wanna, fork it, i add a new features and options, such as nested table and more...
// this version is completely diffirent then the minified one so if you wanna fork it, u have to make your own minified file
// and still there is some bugs and if you notice some of them please let me know in the Issues tab.
// and thank you.


; (!function ($) {
    "use strict";
    $.fn.ediTable = function (options) {
        var values = [], _instances = [];
        var options = $.extend(true, {
            editable: true,
            // convert json to table
            json: {
                head: [],
                body: [],
                primaryKey: {
                    name: undefined,
                    as: {
                        attr: false,
                        cell: true,
                    }
                },
            },
            // Edit/Save Button Properties
            button: {
                edit: {
                    active: false,
                    text: "edit",  // TEXT/HTML
                    selector: "edit", // class
                },
                delete: {
                    active: false,
                    text: "delete",  // TEXT/HTML
                    selector: "delete", // class
                },
                title: "Actions", // th
            },
            add: false,
            eventHandle: "dblclick",
            keyboard: true,
            nested: {
                active: false,
                editable: true,
                json: {
                    head: [],
                    primaryKey: {
                        index: undefined,
                        as: {
                            attr: false,
                            cell: true,
                        }
                    },
                },
                title: "",
                text: "show",
                textActive: "hide",
                right: 0,
                left: 0,
                button: {
                    edit: {
                        active: false,
                        text: "edit",  // TEXT/HTML
                        selector: "edit", // class
                    },
                    delete: {
                        active: false,
                        text: "delete",  // TEXT/HTML
                        selector: "delete", // class
                    },
                    title: "Actions", // th
                },
            },
            beforeSave: function () { },
            afterSave: function () { },
            beforeEdit: function () { },
            afterEdit: function () { },
            beforeDelete: function () { },
            afterDelete: function () { },
            beforeAdd: function () { },
            afterAdd: function () { },
            beforeAppend: function () { },
            afterAppend: function () { },
        }, options);
        var defaultButtons = ["edit", "delete", "title"];
        // init function
        var init = function ($this) {
            $this.find("*").unbind();
            $this.unbind();
            $this.addClass("ediTable");
            if (options.editable) {
                $($this).on(options.eventHandle, ">tbody>tr:not(.nested-section)", toggle);
                $this.children("tbody").children("tr").addClass("editable-row-style");
            }
            if (options.button) {
                if (options.button.edit.active)
                    $this.on("click", "." + options.button.edit.selector, toggle);
                if (options.button.delete.active)
                    $this.on("click", "." + options.button.delete.selector, remove);
                $.each(options.button, function (label, button) {
                    if (defaultButtons.indexOf(label) == -1) {
                        if (button.action != undefined && button.action != "" && button.action != null) {
                            if (button.selector != undefined)
                                $this.on("click", "." + button.selector, function (e) {
                                    button.action(getValues($(e.currentTarget).parents("tr")), $(e.currentTarget).parents("tr"));
                                });
                            else
                                return console.error("you missed selector property of button." + label + " object in options E.G \"{\n\tbutton.costumButton:{\n\t\tselector:\".costumButton\" \n\t}\n}\"!");
                        } else
                            return console.error("you missed action function of button." + label + " object in options E.G \"{\n\tbutton.costumButton:{\n\t\taction:\"function($row){HELLO}\" \n\t}\n}\"!");

                    }
                });
            }
            if (options.sortable) {
                $this.children("thead").children('tr').children('th').click(function () {
                    var table = $(this).parents('table').eq(0)
                    var rows = table.find('tr:gt(0)').toArray().sort(sort($(this).index()))
                    var addRows = rows.
                        this.asc = !this.asc
                    if (!this.asc) { rows = rows.reverse() }
                    for (var i = 0; i < rows.length; i++) { table.append(rows[i]) }
                })
                $this.children("thead").children('tr').children('th').addClass("sortable");
            }
            if (options.nested.active) {
                $this.on("click", ".nested-table-button", function (e) {
                    if (options.nested.animationToggle != undefined)
                        options.nested.animationToggle;
                    else
                        $(e.currentTarget).parent("tr").next().toggle();
                    if ($(e.currentTarget).hasClass("active")) {
                        $(e.currentTarget).removeClass("active");
                        $(e.currentTarget).parent().removeClass("active-nested");
                        if (options.nested.text != undefined)
                            $(e.currentTarget).html(options.nested.text);
                    } else {
                        $(e.currentTarget).addClass("active");
                        $(e.currentTarget).parent().addClass("active-nested");
                        if (options.nested.textActive != undefined)
                            $(e.currentTarget).html(options.nested.textActive);
                    }
                });
                if (options.nested.active) {
                    $(".edi-nested-table").ediTable(options.nested);
                }
            }
        }
        var sort = function (index) {
            function getCellValue(row, index) { return $(row).children('td').eq(index).text() }
            return function (a, b) {
                var valA = getCellValue(a, index), valB = getCellValue(b, index)
                return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
            }
        }
        var $buttonActived = false;
        var toggle = function (e) {
            e.stopPropagation();
            var $tr = null;
            if ($(e.currentTarget).prop("tagName") === "TR")
                $tr = $(e.currentTarget);
            else
                $tr = $(e.currentTarget).parents("tr");
            $tr.find(".editable-input").length > 0 ? save($tr) : edit($tr);
        };

        var cancel = function ($tr) {
            var not = "";
            if ($buttonActived)
                not = ":not(:last-child)";
            if (options.nested.active)
                not += ":not(:first-child)";
            $("td" + not, $tr).each(function (indexCell, cell) {
                var done = true;
                if (options.json.head != undefined && options.json.head.length > 0) {
                    if (options.json.head[indexCell].type == "select" || options.json.head[indexCell].type == "checkbox") {
                        $(cell).attr("data-value", values[$tr.prevAll().length][$(cell).attr("data-index")]);
                        $(cell).html(options.json.head[indexCell].label(values[$tr.prevAll().length][$(cell).attr("data-index")]));
                        done = false;
                    }
                    if (options.json.head[indexCell].type == "color") {
                        $(cell).attr("data-value", values[$tr.prevAll().length][$(cell).attr("data-index")]);
                        $(cell).css("background-color", values[$tr.prevAll().length][$(cell).attr("data-index")]);
                        $(cell).html("");
                        done = false;
                    }
                    if (options.json.head[indexCell].type == "image") {
                        done = false;
                    }
                }
                if (done)
                    $(cell).html(values[$tr.prevAll().length][$(cell).attr("data-index")])
            })
            $.each(options.button, function () {
                if (this.active) {
                    if (this.text != undefined)
                        $("." + this.selector, $tr).html(this.text);
                }
            })
        };
        var save = function ($tr) {
            options.beforeSave(values[$tr.prevAll().length], $tr);
            var not = "", indexID = 0, indexStr = "";
            if ($buttonActived)
                not = ":not(:last-child)";
            if (options.nested.active)
                not += ":not(:first-child)";
            var required = [], invalid = [], newValues = {};
            $tr.children("td" + not).each(function (indexCell, cell) {

                if (options.json.head[indexCell].editable != false) {
                    if ($('.editable-input:input', $(cell)).length == 0)
                        return;
                    if (options.json.head[indexCell].validation != false && $('.editable-input:input', $(cell))[0].checkValidity() == false) {
                        invalid.push({
                            input: $('.editable-input:input', $(cell)),
                            row: $tr.prevAll().length,
                            column: indexCell
                        });
                        $('.editable-input:input', $(cell)).addClass("error");
                    }
                    if (options.json.head[indexCell].required != false && options.json.head[indexCell].type != "checkbox") {
                        if ($('.editable-input:input', $(cell)).val() == "" || $('.editable-input:input', $(cell)).val() == undefined || $('.editable-input:input', $(cell)).val() == null) {
                            required.push({
                                input: $('.editable-input:input', $(cell)),
                                row: $tr.prevAll().length,
                                column: indexCell
                            });
                            $('.editable-input:input', $(cell)).addClass("error");
                        }
                    }
                }
            });
            if (required.length > 0) {
                if (options.requiredAction)
                    options.requiredAction(required);
                else
                    alert("Fields required.");
                return
            }
            if (invalid.length > 0) {
                if (options.invalidAction)
                    options.invalidAction(invalid);
                else
                    alert("Fields invalid.");
                return
            }
            $tr.children("td" + not).each(function (indexCell, cell) {
                var done = true, notEditable = false, suffix = "", prefix = "";
                if ($(cell).attr("data-index") != undefined)
                    indexStr = $(cell).attr("data-index");
                else
                    indexStr = indexID;
                if (options.json.head.length > 0) {
                    if (options.json.head[indexCell].suffix != undefined)
                        suffix = " " + options.json.head[indexCell].suffix;
                    if (options.json.head[indexCell].prefix != undefined)
                        prefix = options.json.head[indexCell].prefix + " ";
                    if (options.json.head[indexCell].type == "color") {
                        done = false;
                        if (options.json.head[indexCell].editable == false)
                            notEditable = true;
                        else
                            newValues[indexStr] = $('.editable-input:input', $(cell)).val();
                        $(cell).attr("data-value", $('.editable-input:input', $(cell)).val());
                        $(cell).css({
                            "background-color": $('.editable-input:input', $(cell)).val(),
                        });
                        $(cell).html("");
                    }
                    if (options.json.head[indexCell].type == "checkbox") {
                        if (options.json.head[indexCell].checked == undefined || options.json.head[indexCell].unchecked == undefined)
                            return console.error("you missed checked/unchecked property of checkbox!");
                        var checked = "", label = options.json.head[indexCell].checked, checkedVar = options.json.head[indexCell].unchecked;
                        $('.editable-input:input', $(cell)).is(":checked") ? checked = " checked" : false;
                        if ($('.editable-input:input', $(cell)).is(":checked"))
                            checkedVar = options.json.head[indexCell].checked
                        if (options.json.head[indexCell].label != undefined)
                            label = options.json.head[indexCell].label(checkedVar);

                        $(cell).attr("data-value", checkedVar);
                        if (label.indexOf(prefix) == -1)
                            label = prefix + label;
                        if (!label.indexOf(suffix) == -1)
                            label = label + suffix;
                        $(cell).html(label);
                        done = false;
                        if (options.json.head[indexCell].editable != false)
                            newValues[indexStr] = checkedVar;
                        else
                            notEditable = true;
                    }
                    if (options.json.head[indexCell].data != undefined) {
                        var extra = options.json.head[indexCell].data.filter(function (a) {
                            return a.value == $('.editable-input:input', $(cell)).val();
                        });
                        $(cell).attr("data-value", extra[0].value);
                        if (extra[0].label.indexOf(prefix) == -1)
                            extra[0].label = prefix + extra[0].label;
                        if (extra[0].label.indexOf(suffix) == -1)
                            extra[0].label = extra[0].label + suffix;
                        $(cell).html(extra[0].label);
                        done = false;
                        if (options.json.head[indexCell].editable != false)
                            newValues[indexStr] = extra[0].value;
                        else
                            notEditable = true;
                    }
                    if (options.json.head[indexCell].type == "image") {
                        done = false;
                        if (options.json.head[indexCell].editable != false)
                            newValues[indexStr] = ($(cell).find("img").attr("src"));
                        else
                            notEditable = true;
                    }
                }
                if (done) {
                    var label = $('.editable-input:input', $(cell)).val();

                    if (options.json.head[indexCell].editable != false) {
                        if (label.indexOf(prefix) == -1)
                            label = prefix + label;
                        if (label.indexOf(suffix) == -1)
                            label = label + suffix;
                        newValues[indexStr] = $('.editable-input:input', $(cell)).val();
                    }
                    else
                        notEditable = true;
                    $(cell).html(label);

                }
                if (notEditable) {
                    newValues[indexStr] = $(cell).text();
                }
                indexID++;
            });
            $.each(options.button, function () {
                if (this.active) {
                    if (this.text != undefined)
                        $("." + this.selector, $tr).html(this.text);
                }
            })
            options.afterSave(newValues, values[$tr.prevAll().length], $tr);
        };
        var add = function ($tr) {
            options.beforeAdd();
            if (options.nested.active) {
                var not = "", newRowHead = $($tr.clone()), newRowBody = $($tr.next(".nested-section").clone()), notInNested = "";
                if ($buttonActived)
                    not = ":not(:last-child)";
                if (options.nested.active)
                    not += ":not(:first-child)";
                if (options.nested.button.edit.active || options.nested.button.delete.active || Object.size(options.nested.button) > 3)
                    notInNested = ":not(:last-child)";
                newRowHead.children("td" + not).html("");
                newRowHead.children("td" + not).removeAttr("data-value");
                newRowHead.attr("data-index", "@new");
                newRowHead.children("td" + not).removeAttr("style");
                newRowBody.find("tbody>tr:not(:first-child)").remove();
                newRowBody.find("tbody>tr:first-child").children("td" + notInNested).html("");
                newRowBody.find("tbody>tr:first-child").children("td" + notInNested).removeAttr("data-value");
                newRowBody.find("tbody>tr:first-child").attr("data-index", "@new");
                newRowBody.find("tbody>tr:first-child").children("td" + notInNested).removeAttr("style");
                $tr.parent().append(newRowHead);
                $tr.parent().append(newRowBody);
                $(newRowBody.find("table"), $tr.parent()).ediTable(options.nested);
            } else {
                var not = "", newRow = $($tr.clone());
                if ($buttonActived)
                    not = ":not(:last-child)";
                if (options.nested.active)
                    not += ":not(:first-child)";
                newRow.children("td" + not).html("");
                newRow.children("td" + not).removeAttr("data-value");
                newRow.attr("data-index", "@new");
                newRow.children("td" + not).removeAttr("style");
                $tr.parent().append(newRow);
            }
            options.afterAdd($(newRow, $tr));
        }
        var edit = function ($tr) {
            var changes = options.beforeEdit(getValues($tr), $tr), run = false;
            if (changes != undefined && changes.options != undefined) {
                $.extend(true, options, changes.options)
            }
            if (options.nested.active != true)
                run = $($tr, $tr.parent()).is(":last-child");
            else
                run = $($tr, $tr.parent()).next(".nested-section").is(":last-child");
            options.add && run ? add($tr) : false;
            if (options.editable) {
                var not = "";
                $.each(options.button, function () {
                    if (this.active) {
                        if (this.textActive != undefined)
                            $("." + this.selector, $tr).html(this.textActive);
                    }
                })
                if ($buttonActived)
                    not = ":not(:last-child)";
                if (options.nested.active)
                    not += ":not(:first-child)";
                var input = "", indexID = 0, indexStr;
                $tr.children("td" + not).each(function (indexCell, cell) {
                    if ($(cell).attr("data-index") != undefined && $(cell).attr("data-index") != "")
                        indexStr = $(cell).attr("data-index");
                    else
                        indexStr = indexID;
                    indexID++;
                    if (options.json.head[indexCell] == undefined)
                        options.json.head[indexCell] = [];
                    if (options.json.head[indexCell].type == undefined)
                        options.json.head[indexCell].type = "text";
                    if (values[$tr.prevAll().length] == undefined)
                        values[$tr.prevAll().length] = {};
                    values[$tr.prevAll().length][indexStr] = $(cell).text();
                    if (options.json.head[indexCell].type == "select" || options.json.head[indexCell].type == "color" || options.json.head[indexCell].type == "checkbox")
                        values[$tr.prevAll().length][indexStr] = $(cell).attr("data-value");
                    if (options.json.head[indexCell].type == "image")
                        return values[$tr.prevAll().length][indexStr] = $(cell).children("img").attr("src");
                    if (options.json.head[indexCell].editable != false) {
                        if (options.json.head[indexCell].html != undefined && options.json.head[indexCell].html.input != undefined)
                            return $(cell).html(options.json.head[indexCell].html.input);
                        input = "<input type=";
                        var classes = " class=\"editable-input\"", id = "", value = " value=\"" + (values[$tr.prevAll().length][indexStr] === undefined || values[$tr.prevAll().length][indexStr] === null || values[$tr.prevAll().length][indexStr] === "" ? (options.json.head[indexCell].value ? options.json.head[indexCell].value : "") : values[$tr.prevAll().length][indexStr]) + "\"";
                        if (options.json.head[indexCell].classes != undefined && options.json.head[indexCell].classes.input != undefined)
                            classes = "class=\"" + options.json.head[indexCell].classes.input + " editable-input\" ";

                        if (options.json.head[indexCell].type == "checkbox") {
                            var check = $(cell).attr("data-value");
                            if (options.json.head[indexCell].checked == undefined || options.json.head[indexCell].unchecked == undefined)
                                return console.error("you missed checked/unchecked property for checkbox column!");
                            if (typeof options.json.head[indexCell].checked == "boolean")
                                check = $.parseJSON($(cell).attr("data-value"));

                            input += "\"" + options.json.head[indexCell].type + "\"" + classes + (check == options.json.head[indexCell].checked ? " checked" : "") + "/>";
                        } else if (options.json.head[indexCell].type == "select") {
                            input = "<select " + classes + "><option value=\"\">choose option</option>";
                            $.each(options.json.head[indexCell].data, function (index, item) {

                                var selected = "";
                                if ($(cell).attr("data-value") == item.value)
                                    selected = "selected";
                                input += "<option value=\"" + item.value + "\" " + selected + ">" + item.label + "</option>";
                            });
                            input += "</select>";
                        } else {
                            var min = "", max = "";
                            if (options.json.head[indexCell].type == "number") {
                                if (options.json.head[indexCell].min != undefined)
                                    min = "min=\"" + options.json.head[indexCell].min + "\"";
                                if (options.json.head[indexCell].max != undefined)
                                    max = "max=\"" + options.json.head[indexCell].max + "\"";
                            }
                            input += "\"" + options.json.head[indexCell].type + "\"" + classes + min + max + value + "/>"
                        }
                        $(cell).html(input);
                        $(".editable-input:input", $(cell)).unbind("dblclick");
                        $(".editable-input:input", $(cell)).bind("dblclick", function (e) {
                            e.stopPropagation();
                        });
                        if (options.keyboard) {

                            $(".editable-input:input", $(cell)).on("keydown", function (e) {
                                captureKey(e, $tr);
                            })
                        }
                        if (options.json.head[indexCell].validation != false) {
                            $(':input', $tr.children(":nth-child(" + indexCell + 1 + ")")).blur(function (event) {
                                if (event.target.checkValidity())
                                    $(event.target).removeClass("error")
                                else
                                    $(event.target).addClass("error")
                            });
                        }
                    }
                });
            }
            options.afterEdit(values[$tr.prevAll().length], $tr);
        };
        var captureKey = function (e, $tr) {
            if (e.which === 13) {
                save($tr);
            } else if (e.which === 27) {
                cancel($tr);
            }
        }
        var remove = async function (e) {
            var $tr = $(e.currentTarget).parents("tr");

            options.beforeDelete(getValues($tr), $tr, (done) => {
                if (done) {
                    if ($tr.siblings().length === 0 && options.add) {
                        let $newTr = "<tr>";
                        $.each(options.json.head, (i, item) => {
                            $newTr += "<td data-index=\"" + item.id + "\"></td>";
                        });
                        if (options.button.delete.active || options.button.edit.active || Object.keys.length(options.button) > 2) {
                            $newTr += "<td>";
                            $.each(options.button, function () {
                                if (this.active) {
                                    $newTr += "<span class=\"" + this.selector + "\">" + this.text + "</span>";
                                    $buttonActived = true;
                                }
                            });
                            $newTr += "</td>";

                        }
                        $newTr += "</tr>";
                        $($newTr).insertAfter($tr);
                    }
                    $tr.remove();
                    options.afterDelete(getValues($tr), $tr);
                }
            });
        }
        var getValues = function ($tr, notNested) {
            if (notNested === undefined) notNested = true;
            var _values = {}, not = "", indexStr, indexID = 0;
            if ($buttonActived && notNested)
                not = ":not(:last-child)";
            if (options.nested.active && notNested)
                not += ":not(:first-child)";
            if (options.json.primaryKey.as.cell == false && notNested && options.json.body.length && $tr.attr("data-index") != "@new" && options.json.body[$tr.prevAll(":not(.nested-section)").length] !== undefined)
                _values[options.json.primaryKey.name] = options.json.body[$tr.prevAll(":not(.nested-section)").length][options.json.primaryKey.name];
            else if (options.json.primaryKey.as.cell == false && notNested && options.json.primaryKey.as.attr != "@new")
                _values[options.json.primaryKey.name] = $tr.attr("data-index");

            if (options.nested.active && notNested) {
                if (options.json.body[$tr.prevAll(":not(.nested-section)").length] && options.json.body[$tr.prevAll(":not(.nested-section)").length][options.nested.name] != undefined) {
                    var obj = [];
                    $tr.next().find("tbody>tr").each(function () {
                        obj.push(getValues($(this), false));
                    })
                    _values[options.nested.name] = obj;
                }
            }
            if (options.nested.json.primaryKey.as.cell == false && !notNested)
                _values[options.nested.json.primaryKey.name] = options.json.body[$tr.parents("tr").prev().prevAll(":not(.nested-section)").length][options.nested.name][$tr.prevAll().length][options.nested.json.primaryKey.name];
            $($tr.children(not)).each(function (indexCell, cell) {
                var _check = true;
                if ($(cell).attr("data-index") != undefined && $(cell).attr("data-index") != "")
                    indexStr = $(cell).attr("data-index");
                else if ($(cell).attr("data-nested-index") != undefined && $(cell).attr("data-nested-index") != "")
                    indexStr = $(cell).attr("data-nested-index");
                else
                    indexStr = indexID;
                indexID++;
                if (options.json.head.length) {
                    if (options.json.head[indexCell] == undefined)
                        options.json.head[indexCell] = [];
                    if (options.json.head[indexCell].type == undefined)
                        options.json.head[indexCell].type = "text";
                    if ($(cell).find(".editable-input:input").length) {

                        if (options.json.head[indexCell].type == "checkbox") {
                            var checked = "";
                            $(cell).find(".editable-input:input").is(":checked") ? checked = options.json.head[indexCell].checked : checked = options.json.head[indexCell].unchecked;
                            _values[indexStr] = checked;
                            _check = false;
                        }
                    }
                    if (options.json.head[indexCell].type == "image") {
                        _values[indexStr] = $(cell).find("img").attr("src");
                        _check = false;
                    }
                }
                if (_check) {
                    if ($(cell).find(".editable-input:input").length) {
                        _values[indexStr] = $(cell).find(".editable-input:input").val();
                    } else {
                        _values[indexStr] = $(cell).text();
                    }
                    if (notNested && options.json.head.length > 0 && (options.json.head[indexCell].type == "checkbox" || options.json.head[indexCell].type == "select")) {
                        if (indexStr == "_produit")
                            _values[indexStr] = $(cell).attr("data-value");
                        _check = false;
                    }
                    if (!notNested && options.nested.json.head.length > 0 && (options.nested.json.head[indexCell].type == "checkbox" || options.nested.json.head[indexCell].type == "select")) {
                        _values[indexStr] = $(cell).attr("data-value");
                        _check = false;
                    }
                }
            });
            return _values;
        }
        var ediTable = function ($this) {
            if (options.json.body.length)
                $this.html("");
            if ($this.prop("tagName") !== "TABLE")
                return console.warn("Make sure that you're selecting <table> element!");
            if (options.button.edit.selector === undefined)
                return console.error("you missed selector property of button.edit object in options E.G \"{\n\tbutton.edit:{\n\t\tshow:true/false\n\t}\n}\"!");
            if (options.button.edit.active === undefined)
                return console.error("you missed show property of button.edit object in options E.G \"{\n\tbutton.edit:{\n\t\tshow:true/false\n\t}\n}\"!");
            var $table = "<thead><tr>";
            if (options.nested.active)
                $table += "<th>" + options.nested.title + "</th>";
            var i = 0, heads;
            if (options.json.body.length > 0)
                heads = options.json.body[0];
            if (options.json.head.length > 0)
                heads = options.json.head;
            $.each(heads, function (index, value) {
                var classesTh = "";
                if (options.json.primaryKey.name != undefined && options.json.primaryKey.as.cell != true && index == options.json.primaryKey.name)
                    return;
                if (options.json.head[i] != undefined && options.json.head[i].classes != undefined && options.json.head[i].classes.th != undefined)
                    classesTh = "class=\"" + options.json.head[i].classes.th + "\"";
                if (options.nested.active && index == options.nested.name)
                    return
                else if (options.json.head.length && options.json.head[i] != undefined && options.json.head[i].title != undefined)
                    $table += "<th " + classesTh + ">" + options.json.head[i].title + "</th>";
                else
                    $table += "<th " + classesTh + ">" + index + "</th>";
                i++;
            });
            $table += "</tr>";
            $table += "</thead>";
            $this.prepend($table);
            if (options.json.body != undefined) {
                var $table = "<tbody>";
                if (options.json.head == undefined)
                    options.json.head = {};
                $.each(options.json.body, function (indexRow, row) {
                    $table += "<tr " + (options.json.primaryKey.name != undefined && options.json.primaryKey.as.attr ? "data-index=\"" + row[options.json.primaryKey.name] + "\"" : "") + ">";
                    var i = 0, nestedTable = "";
                    if (options.nested.active && row[options.nested.name] != undefined)
                        $table += "<td class=\"nested-table-button\">" + options.nested.text + "</td>";
                    else if (options.nested.active)
                        $table += "<td></td>";
                    $.each(row, function (indexCell, cell) {
                        var done = true, suffix = "", prefix = "", classesTd = "", nested = true;
                        if (options.nested.active && indexCell == options.nested.name) {
                            var nestedClasses = "class=\"edi-nested-table\"";
                            if (options.nested.classes != undefined)
                                nestedClasses = " class=\"edi-nested-table " + options.nested.classes + "\"";
                            nestedTable = "<tr style=\"display:none\" class=\"nested-section\">"
                            for (var x = 0; x < options.nested.left; x++) {
                                nestedTable += "<td class='nested-side edi-left" + (x == options.nested.left - 1 ? " last-side" : "") + "'></td>";
                            }
                            nestedTable += "<td colspan=\"" + eval(Object.size(options.json.body[0]) - options.nested.right - options.nested.left + (!options.nested.json.primaryKey.as.cell ? 1 : 0)) + "\" class=\"nested-content\" style=\"padding:0\"><table" + nestedClasses + ">";
                            nestedTable += "<tbody>"
                            $.each(cell, function (indexNestedRow, NestedRow) {
                                nestedTable += "<tr " + (options.nested.json.primaryKey.name != undefined && options.nested.json.primaryKey.as.attr ? "data-index=\"" + NestedRow[options.nested.json.primaryKey.name] + "\"" : "") + ">"
                                var j = 0;
                                $.each(NestedRow, function (indexNestedCell, NestedCell) {

                                    if (options.nested.json.primaryKey.name != undefined && options.nested.json.primaryKey.as.cell != true && indexNestedCell == options.json.primaryKey.name)
                                        return;
                                    var classTd = "";
                                    if (options.nested.json.head[j].classes != undefined && options.nested.json.head[j].classes.td != undefined)
                                        classTd = "class=\"" + options.nested.json.head[j].classes.td + "\"";
                                    nestedTable += "<td data-nested-index=\"" + indexNestedCell + "\" " + classTd + ">" + NestedCell + "</td>";
                                    j++;
                                });
                                nestedTable += "</tr>"
                            });
                            nestedTable += "</tr></tbody>"

                            nestedTable += "</table></td>"
                            for (var x = 0; x < options.nested.right; x++) {
                                nestedTable += "<td class='nested-side edi-right " + (x == 0 ? " first-side" : "") + "'></td>";
                            }
                            nestedTable += "</tr>";
                            nested = false
                            done = false;
                        }
                        if (options.json.primaryKey.name != undefined && options.json.primaryKey.as.cell != true && indexCell == options.json.primaryKey.name)
                            return;
                        if (nested && options.json.head.length > 0 && options.json.head[i] != undefined) {
                            if (options.json.head[i].suffix != undefined)
                                suffix = " " + options.json.head[i].suffix;
                            if (options.json.head[i].prefix != undefined)
                                prefix = options.json.head[i].prefix + " ";
                            if (options.json.head[i].classes != undefined && options.json.head[i].classes.td != undefined)
                                classesTd = " class=\"" + options.json.head[i].classes.td + "\" ";
                            if (options.json.head[i].type == "color") {
                                $table += "<td data-index=\"" + indexCell + "\"" + classesTd + " data-value=\"" + cell + "\" style=\"background-color:" + prefix + cell + suffix + "\"></td>";
                                done = false;
                            }
                            if (options.json.head[i].type == "select") {
                                if (options.json.head[i].data != undefined) {
                                    var extra = options.json.head[i].data.filter(function (a) {
                                        return a.value == cell;
                                    });
                                    if (!extra.length)
                                        return console.error("make sure that your data is correct!");
                                    $table += "<td data-index=\"" + indexCell + "\"" + classesTd + " data-value=\"" + extra[0].value + "\">" + prefix + extra[0].label + suffix + "</td>";
                                    done = false;
                                }
                            }
                            if (options.json.head[i].type == "image") {
                                $table += "<td data-index=\"" + indexCell + "\"" + classesTd + "><img src=\"" + cell + "\"/></td>";
                                done = false;
                            }

                            if (options.json.head[i].type == "checkbox") {
                                var checked = options.json.head[i].unchecked, label = cell;
                                if (options.json.head[i].checked == undefined || options.json.head[i].unchecked == undefined)
                                    return console.error("you missed checked/unchecked property for checkbox column!");
                                if (typeof options.json.head[i].checked == "boolean")
                                    $.parseJSON(cell);
                                if (options.json.head[i].checked == cell)
                                    checked = options.json.head[i].checked;
                                if (options.json.head[i].label != undefined)
                                    label = options.json.head[i].label(checked)
                                $table += "<td data-index=\"" + indexCell + "\"" + classesTd + " data-value=\"" + checked + "\">" + prefix + label + suffix + "</td>";
                                done = false;
                            }
                        }
                        if (done)
                            $table += "<td data-index=\"" + indexCell + "\"" + classesTd + ">" + prefix + cell + suffix + "</td>";
                        i++;
                    });
                    $table += "</tr>" + nestedTable;
                });
                $table += "</tbody>";
                var changes = options.beforeAppend($($table));
                if (changes != undefined) {
                    $table = changes;
                }
                $this.append($table);
            }

            if (options.editable) {
                $.each($this.children("tbody").children("tr" + (options.nested.active ? ":not(.nested-section)" : "")), function (index, item) {
                    var $cell = "<td>";
                    $.each(options.button, function () {
                        if (this.active) {
                            $cell += "<span class=\"" + this.selector + "\">" + this.text + "</span>";
                            $buttonActived = true;
                        }
                    });
                    if ($buttonActived)
                        $(item).append($cell + "</td>");
                });
                if ($buttonActived)
                    $this.children("thead").children("tr:first-child")
                        .append("<th rowspan=\"" + $this.children("thead").children("tr").length + "\">" + options.button.title + "</th>");
                if (options.add != false) {
                    var $newtr = "<tr data-index='@new'>";
                    $.each(options.json.head, (i, item) => {
                        $newtr += "<td data-index=\"" + item.id + "\"></td>";
                    });
                    if (options.button.delete.active || options.button.edit.active || Object.keys.length(options.button) > 2) {
                        if (options.add && options.json.body.length === 0&&$this.find("thead>tr>th:last-child").html()!==options.button.title)
                            $this.find("thead>tr").append($("<th>" + options.button.title + "</th>"));
                        $newtr += "<td>";
                        $.each(options.button, function () {
                            if (this.active) {
                                $newtr += "<span class=\"" + this.selector + "\">" + this.text + "</span>";
                                $buttonActived = true;
                            }
                        });
                        $newtr += "</td>";
                    }
                    $newtr += "</tr>";
                    $this.find("tbody").append($($newtr));
                }
            }
            var changes = options.afterAppend($($table));
            if (changes != undefined && changes.tbody != undefined)
                $table = changes.tbody;
            init($this);
            if (!$this.find("thead tr").length)
                console.warn("table without heads!");
            if (!$this.find("tbody tr").length) {
                console.warn("Empty table!");

                $this.children("tbody").length == 0 ? $this.append("<tbody></tbody>") : 0;
            }
            return
        }

        this.each(function () {
            _instances.push($(this));
            ediTable($(this));
        });
        var data = function (index) {
            if (index === undefined) { index = 0; }
            var data = [];
            _instances[index].children("tbody").children("tr:not(.nested-section)").each(function (indexRow, row) {
                data.push(getValues($(row)));
            });
            return data;
        }
        var reinitialize = function (index, newOptions) {

            if (newOptions != undefined) {
                options = $.extend(true, options, newOptions);
            }
            if (index === undefined) {
                return $.each(_instances, function () {
                    ediTable($(this));
                });

            }
            ediTable(_instances[index]);
        }
        Object.size = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        return {
            data: data,
            reinitialize: reinitialize
        }
    };
}($));
