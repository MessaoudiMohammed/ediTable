//************************************************************************//
//                        Editable.js v0.0.3 (beta)                       //
//                         Date Release:04/02/2019                        //
//                     Developed By:Mohammed Messaoudi                    //
//                 https://github.com/OxiGen1001/ediTable/                //
//************************************************************************//
;(!function($){
    "use strict";
    $.fn.ediTable=function(options){
        var values=[];
        var _instances=[];
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
            beforeAdd:function(){},
            afterAdd:function(){},
            beforeAppend:function(){},
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
                    $this.on("click","."+options.button.edit.selector,toggle);
                if(options.button.delete.active)
                    $this.on("click","."+options.button.delete.selector,remove);
                $.each(options.button,function(label,button)
                {
                    if(!defaultButtons.includes(label))
                    {
                        if(button.action!=undefined&&button.action!=""&&button.action!=null)
                        {
                            if(button.selector!=undefined)
                                $this.on("click","."+button.selector,function(e){
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
                not=":not(:last-child)";
            $("td"+not,$tr).each(function(indexCell,cell){
                var done=true;
                if(options.json.head!=undefined&&options.json.head.length>0)
                {
                    if(options.json.head[indexCell].type=="select"||options.json.head[indexCell].type=="checkbox")
                    {
                        $(cell).attr("data-value",values[$tr.prevAll().length][$(cell).attr("data-index")]);
                        $(cell).html(options.json.head[indexCell].label(values[$tr.prevAll().length][$(cell).attr("data-index")]));
                        done=false;
                    }
                    if(options.json.head[indexCell].type=="color")
                    {
                        $(cell).attr("data-value",values[$tr.prevAll().length][$(cell).attr("data-index")]);
                        $(cell).css("background-color",values[$tr.prevAll().length][$(cell).attr("data-index")]);
                        $(cell).html("");
                        done=false;
                    }
                    if(options.json.head[indexCell].type=="image")
                    {
                        done=false;
                    }
                }
                if(done)
                    $(cell).html(values[$tr.prevAll().length][$(cell).attr("data-index")])
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
            options.beforeSave(values[$tr.prevAll().length],$tr);
            var not="",indexID=0,indexStr="";
            if($buttonActived)
                not=":not(:last-child)";
            var required=[],invalid=[],newValues={};
            $tr.children("td"+not).each(function(indexCell,cell){
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
                    alert("Fields required.");
                return
            }
            if(invalid.length>0)
            {
                if(options.invalidAction)
                    options.invalidAction(invalid);
                else
                    alert("Fields invalid.");
                return
            }
            
