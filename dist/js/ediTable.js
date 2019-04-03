//************************************************************************//
//                        Editable.js v0.0.1 (beta)                       //
//                         Date Release:04/02/2019                        //
//                     Developed By:Mohammed Messaoudi                    //
//                 https://github.com/OxiGen1001/ediTable/                //
//************************************************************************//
;(!function($){
    "use strict";
    $.fn.ediTable=function(options){
        var values=[];
        var options = $.extend(true,{
            editable:true,
            // convert json to table
            json:{
                head:[],
                body:[]
            },            
            // Edit/Save Button Properties
            button:{
                edit:{
                    active:false,
                    text:"edit",  // TEXT/HTML
                    selector:"edit", // class
                },
                delete:{
                    active:false,
                    text:"delete",  // TEXT/HTML
                    selector:"delete", // class
                },
                title:"Actions", // th
            },
            add:false,
            keyboard: true,
            beforeSave:function(){},
            afterSave:function(){},
            beforeEdit:function(){},
            afterEdit:function(){},
            beforeDelete:function(){},
            afterDelete:function(){},
        },options);
        var defaultButtons=["edit","delete","title"];
        // init function
        var init = function($this){
            if(options.editable)   
            {
                $($this).on('dblclick', 'tbody>tr',toggle);
                $this.children("tbody").children("tr").addClass("editable-row-style");
            }
            
            if (options.button) {
                if(options.button.edit.active)
                    $("."+options.button.edit.selector, $this)
                        .bind('click', toggle);
                if(options.button.delete.active)
                    $("."+options.button.delete.selector, $this)
                        .bind('click', remove);
                $.each(options.button,function(label,button)
                {
                    if(!defaultButtons.includes(label))
                    {
                        if(button.action!=undefined&&button.action!=""&&button.action!=null)
                        {
                            if(button.selector!=undefined)
                            $("."+button.selector, $this)
                                .bind('click', function(e){
                                    
                                    button.action(getValues($(e.currentTarget).parents("tr")),$(e.currentTarget).parents("tr"));
                                });
                            else
                                return console.error("you missed selector property of button."+label+" object in options E.G \"{\n\tbutton.costumButton:{\n\t\tselector:\".costumButton\" \n\t}\n}\"!");
                        }else
                            return console.error("you missed action function of button."+label+" object in options E.G \"{\n\tbutton.costumButton:{\n\t\taction:\"function($row){HELLO}\" \n\t}\n}\"!");

                    }
                });
            }
            if(options.sortable)
            {
                $this.children("thead").children('tr').children('th').click(function(){
                    var table = $(this).parents('table').eq(0)
                    var rows = table.find('tr:gt(0)').toArray().sort(sort($(this).index()))
                    this.asc = !this.asc
                    if (!this.asc){rows = rows.reverse()}
                    for (var i = 0; i < rows.length; i++){table.append(rows[i])}
                })
                $this.children("thead").children('tr').children('th').addClass("sortable");
            }
        }
        var sort = function(index)
        { 
            function getCellValue(row, index){ return $(row).children('td').eq(index).text() }
            return function(a, b) {
                var valA = getCellValue(a, index), valB = getCellValue(b, index)
                return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
            }
        }
        var $buttonActived=false;
        var toggle= function(e){
            e.stopPropagation();
            var $tr=null;
            if($(e.currentTarget).prop("tagName")==="TR")
                $tr=$(e.currentTarget);
            else
                $tr=$(e.currentTarget).parents("tr");
            $tr.find(".editable-input").length>0?save($tr):edit($tr); 
        };
        
        var cancel= function($tr){
            var not="";
            if($buttonActived)
                not=`:not(:last-child)`;
            $("td"+not,$tr).each(function(indexCell,cell){
                var done=true;
                if(options.json.head!=undefined&&options.json.head.length>0)
                {
                    if(options.json.head[indexCell].type=="select"||options.json.head[indexCell].type=="checkbox")
                    {
                        $(cell).attr("data-value",values[$tr.prevAll().length][indexCell].value);
                        $(cell).html(values[$tr.prevAll().length][indexCell].label);
                        done=false;
                    }
                    if(options.json.head[indexCell].type=="color")
                    {
                        $(cell).attr("data-value",values[$tr.prevAll().length][indexCell].value);
                        $(cell).css("background-color",values[$tr.prevAll().length][indexCell].value);
                        $(cell).html("");
                        done=false;
                    }
                    if(options.json.head[indexCell].type=="image")
                    {
                        done=false;
                    }
                }
                if(done)
                    $(cell).html(values[$tr.prevAll().length][indexCell].value)
            })
            $.each(options.button,function(){
                if(this.active)
                {
                    if(this.text!=undefined)
                        $("."+this.selector,$tr).html(this.text);
                }
            })
        };
        var save = function($tr)
        {
            options.beforeSave(getValues($tr),$tr);
            var not="";
            if($buttonActived)
                not=`:not(:last-child)`;
            var required=[],invalid=[],newValues=[];
            $tr.children(`td${not}`).each(function(indexCell,cell){
                if(options.json.head[indexCell].editable!=false)
                {
                    if($('.editable-input:input',$(cell)).length==0)
                        return;
                    if(options.json.head[indexCell].validation!=false&&$('.editable-input:input',$(cell))[0].checkValidity()==false)
                    {
                        invalid.push({
                            input:$('.editable-input:input',$(cell)),
                            row:$tr.prevAll().length,
                            column:indexCell
                        });
                        $('.editable-input:input',$(cell)).addClass("error");
                    }
                    if(options.json.head[indexCell].required!=false&&options.json.head[indexCell].type!="checkbox")
                    {
                        if($('.editable-input:input',$(cell)).val()==""||$('.editable-input:input',$(cell)).val()==undefined||$('.editable-input:input',$(cell)).val()==null)
                        {
                            required.push({
                                input:$('.editable-input:input',$(cell)),
                                row:$tr.prevAll().length,
                                column:indexCell
                            });
                            $('.editable-input:input',$(cell)).addClass("error");
                        }
                    }
                }
            });
            if(required.length>0)
            {
                if(options.requiredAction)
                    options.requiredAction(required);
                else
                    alert(`Fields required.`);
                return
            }
            if(invalid.length>0)
            {
                if(options.invalidAction)
                    options.invalidAction(invalid);
                else
                    alert(`Fields invalid.`);
                return
            }
            $tr.children(`td${not}`).each(function(indexCell,cell){
                var done=true;
                if(options.json.head.length>0)
                {
                    if(options.json.head[indexCell].type=="color")
                    {
                        newValues.push($(cell).val());
                        $(cell).data("value",$('.editable-input:input',$(cell)).val());
                        $(cell).css({
                            "background-color":$('.editable-input:input',$(cell)).val(),
                        });
                        $(cell).html("");
                        done=false;
                    }       
                    if(options.json.head[indexCell].type=="checkbox")
                    {
                        if(options.json.head[indexCell].checked==undefined)
                            return console.error("you missed checked property of checkbox!");
                        var checked="",label=options.json.head[indexCell].checked;
                        $('.editable-input:input',$(cell)).is(":checked")?checked=" checked":false;
                        if(options.json.head[indexCell].label!=undefined)
                            label=options.json.head[indexCell].label($('.editable-input:input',$(cell)).is(":checked"));
                        $(cell).attr("data-value",$('.editable-input:input',$(cell)).is(":checked"));
                        $(cell).html(label);
                        newValues.push({label:label,value:$(cell).val()});
                        done=false;
                    }
                    if(options.json.head[indexCell].data!=undefined)
                    {
                        var extra=options.json.head[indexCell].data.filter(function(a){
                            return a.value==$('.editable-input:input',$(cell)).val();
                        });
                        $(cell).data("value",extra[0].value);
                        $(cell).html(extra[0].label);
                        newValues.push({label:extra[0].label,value:extra[0].value});

                        done=false;
                    }
                }
                if(done)
                {
                    newValues.push($(cell).val());
                    $(cell).html($('.editable-input:input',$(cell)).val());
                }
            });
            $.each(options.button,function(){
                if(this.active)
                {
                    if(this.text!=undefined)
                        $("."+this.selector,$tr).html(this.text);
                }
            })
            options.afterSave(newValues,values[$tr.prevAll().length],$tr);
        };
        var add = function($tr)
        {
            var not="",newRow=$($tr.clone());
            if($buttonActived)
                not=`:not(:last-child)`;
            newRow.children(`td${not}`).html("");
            newRow.children(`td${not}`).data("value","");
            newRow.children(`td${not}`).removeAttr("style");
            if($tr.is("tr:last"))
                $tr.parent().append(newRow);
        }
        var edit = function($tr)
        {
            options.beforeEdit(getValues($tr),$tr);
            options.add?add($tr):false;
            var not="";
            $.each(options.button,function(){
                if(this.active)
                {
                    if(this.textActive!=undefined)
                        $("."+this.selector,$tr).html(this.textActive);
                }
            })
            
            var input="";
            $tr.children(`td${not}`).each(function(indexCell,cell){
                
                if($buttonActived&&$(cell).is(":last-child"))
                    return;
                if(options.json.head[indexCell]==undefined)
                    options.json.head[indexCell]=[];
                if(options.json.head[indexCell].type==undefined)
                        options.json.head[indexCell].type="text";
                if(values[$tr.prevAll().length]==undefined)
                    values[$tr.prevAll().length]=[];
                values[$tr.prevAll().length][indexCell]={
                    value:$(cell).text(),
                };
                if(options.json.head[indexCell].type=="select"||options.json.head[indexCell].type=="color"||options.json.head[indexCell].type=="checkbox")
                values[$tr.prevAll().length][indexCell]={
                    label:$(cell).text(),
                    value:$(cell).attr("data-value"),
                };
                
                if(options.json.head[indexCell].type=="image")
                {
                    values[$tr.prevAll().length][indexCell]={
                        value:$(cell).children("img").attr("src"),
                    };
                    return;
                }
                    
                if(options.json.head[indexCell].editable!=false)
                {
                    input="<input style=\"width:"+$(cell).width()+"px\" type=";
                    var classes="class=\"editable-input\"",id="",value="value=\""+values[$tr.prevAll().length][indexCell].value+"\"";
                    if(options.json.head[indexCell].classes!=undefined)
                        classes="class=\""+options.json.head[indexCell].classes+" editable-input\" ";                    
                    if(options.json.head[indexCell].type=="checkbox")
                    {
                        if(options.json.head[indexCell].checked==undefined)
                            return console.error("you missed checked property for checkbox column!");
                                 
                        input+=`"${options.json.head[indexCell].type}" ${classes} ${$(cell).attr("data-value")==options.json.head[indexCell].checked?"checked":false} />`;


                    }else if(options.json.head[indexCell].type=="select")
                    {
                        input=`<select ${classes}>`;
                        $.each(options.json.head[indexCell].data,function(index,item){
                            
                            var selected="";
                            if($(cell).attr("data-value")==item.value)
                                selected="selected";
                            input+=`<option value="${item.value}" ${selected} >${item.label}</option>`
                        });
                        input+="</select>";
                    }else
                    {
                        var min="",max="";
                        if(options.json.head[indexCell].type=="number")
                        {
                            if(options.json.head[indexCell].min!=undefined)
                                min="min=\""+options.json.head[indexCell].min+"\"";
                            if(options.json.head[indexCell].max!=undefined)
                                max="max=\""+options.json.head[indexCell].max+"\"";
                        }
                        input+=`"${options.json.head[indexCell].type}" ${classes} ${min} ${max} ${value} />`
                    }
                    $(cell).html(input);
                    $(".editable-input:input",$(cell)).unbind("dblclick");
                    $(".editable-input:input",$(cell)).bind("dblclick",function(e){
                        e.stopPropagation();
                    });
                    if (options.keyboard) {
                        
                        $(".editable-input:input",$(cell)).on("keydown",function(e){
                            captureKey(e,$tr);
                        })
                    }
                    if($(this).data("id")&&$(this).data("type")=="select")
                    {
                        $(this).children("select").val($(this).data("id"));
                    }
                   
                    if(options.json.head[indexCell].validation!=false)
                    {
                        $(':input',$tr.children(`:nth-child(${indexCell+1})`)).blur(function(event) {
                            if(event.target.checkValidity())
                                $(event.target).removeClass("error")
                            else
                                $(event.target).addClass("error")
                        });
                    }
                }
            });
            options.afterEdit(values[$tr.prevAll().length],$tr);
        };
        var captureKey= function(e,$tr){
            if (e.which === 13) {
                save($tr);
            } else if (e.which === 27) {
                cancel($tr);
            }
        }
        var remove = function(e){
            var $tr=$(e.currentTarget).parents("tr");
            options.beforeDelete(getValues($tr),$tr);
            $tr.remove();
            options.afterDelete(getValues($tr),$tr);
        }
        var getValues=function($tr){
            var _values=[];
            var not="";
            if($buttonActived)
                not=":not(:last-child)";
            $($tr.children(not)).each(function(indexCell,cell){
                var _check=true;
                if(options.json.head.length)
                {
                    if($(cell).find(".editable-input:input").length)
                    {
                        if(options.json.head[indexCell].type=="checkbox")
                        {
                            _values.push($(cell).find(".editable-input:input").is(":checked"));
                            _check=false;
                        }
                        if(options.json.head[indexCell].type=="image")
                        {
                            _values.push($(cell).find("img").attr("src"));
                            _check=false;
                        }
                    }
                }
                if(_check)
                {
                    if($(cell).find(".editable-input:input").length)
                    {
                        _values.push($(cell).find(".editable-input:input").val());
                    }else
                    {
                        _values.push($(cell).text());
                    }
                }
            })
        }
        var ediTable =function($this)
        {
            if($this.prop("tagName")!=="TABLE") 
                return console.warm("Make sure that you're selecting <table> element!");
            if(options.button.edit.selector===undefined)
                return console.error("you missed selector property of button.edit object in options E.G \"{\n\tbutton.edit:{\n\t\tshow:true/false\n\t}\n}\"!");
            if(options.button.edit.active===undefined)
                return console.error("you missed show property of button.edit object in options E.G \"{\n\tbutton.edit:{\n\t\tshow:true/false\n\t}\n}\"!");
            var $table=`<thead>`;
                $table+=`<tr>`;
                var i=0;
                $.each(options.json.body[0], function( index, value ) {
                    if(options.json.head.length&&options.json.head[i].title!=undefined)
                        $table+=`<th>${options.json.head[i].title}</th>`;
                    else
                        $table+=`<th>${index}</th>`;
                    i++;
                });
                $table+=`</tr>`;
            $table+=`</thead>`;
            $this.prepend($table);
            if(options.json.body!=undefined&&options.json.body.length>0)
            {
                var $table=`<tbody>`;
                if(options.json.head==undefined)
                    options.json.head={};
                $.each(options.json.body, function( indexRow, row ) {
                    $table+=`<tr>`;
                    var i=0;
                    $.each(row, function( indexCell, cell ) {
                        var done=true;
                        if(options.json.head.length>0)
                        {
                            if(options.json.head[i].type=="color")
                            {
                                $table+=`<td class="${indexCell}" data-value="${cell}" style="background-color:${cell}"></td>`;
                                done=false;
                            }                  
                            if(options.json.head[i].type=="select")    
                            {
                                if(options.json.head[i].data!=undefined)
                                {
                                    var extra=options.json.head[i].data.filter(function(a){
                                        return a.value==cell;
                                    });
                                    if(!extra.length)
                                        return console.error("make sure that your data is correct!");
                                    $table+=`<td class="${indexCell}" data-value="${extra[0].value}" >${extra[0].label}</td>`;
                                    done=false;
                                }
                            }
                            if(options.json.head[i].type=="image")
                            {
                                $table+=`<td class="${indexCell}" ><img src="${cell}"/></td>`;
                                done=false;
                            }
                                
                            if(options.json.head[i].type=="checkbox")
                            {

                                var checked="",label=cell;
                                if(options.json.head[i].checked==undefined)
                                    return console.error("you missed checked property for checkbox column!");
                                
                                if(options.json.head[i].checked==cell)
                                    checked="checked";
                                if(options.json.head[i].label!=undefined)
                                    label=options.json.head[i].label(options.json.head[i].checked==cell)
                                    
                                $table+=`<td class="${indexCell}" data-value="${options.json.head[i].checked==cell}" >${label}</td>`;
                                done=false;
                                
                            }
                        }
                        if(done)
                            $table+=`<td class="${indexCell}" >${cell}</td>`;
                        i++;
                    });
                    $table+=`</tr>`;
                });
                $table+=`</tbody>`;
                $this.append($table);
            }
            if(options.editable)
            {
                $.each($this.children("tbody").children("tr"),function(index,item)
                {
                    var $cell="<td>";
                    $.each(options.button,function(){
                        if(this.active)
                        {
                            $cell+=`
                                <span class="${this.selector}" >${this.text}</span>`;
                            $buttonActived=true;
                        }
                    });
                    if($buttonActived)
                        $(item).append($cell+"</td>");
                });
                if($buttonActived)
                    $this.children("thead").children("tr:first-child").append(`
                            <th rowspan="${$this.children("thead").children("tr").length}">${options.button.title}</th>
                        `);
            
            }
            init($this);
            if(!$this.find("thead tr").length)
                console.warn("table without heads!");
            if(!$this.find("tbody tr").length)
                console.warn("Empty table!");
        }
        
        this.each(function(){
            ediTable($(this));
        });
        return {
            elememt:this,
            options:options
        }
        
    };
}($));

