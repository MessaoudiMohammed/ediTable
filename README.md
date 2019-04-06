
﻿# ediTable v0.0.3 (beta) Jquery Plugin

ediTable is a JQuery plugin that lets you create table via json,make it sortable, also editable so you can manipulate any cell, set type of input for every cell (text, number, color, select, image, checkbox...) validate cells, make them required etc... add buttons edit/delete/costum buttons...

Demo:
-   Basic:  [link](https://codepen.io/OxiDev/pen/JVYGzO)
-   Advanced:  [link](https://codepen.io/OxiDev/pen/EJVKMd)

## Features overview

- Works with any Design Framework (bootstrap,material,materializecss...).
- Creation via (html/json/mix).
- Editable/Sortable table.
- Type of columns (text, number, color, select, image, checkbox...).
- Validation of inputs columns + Require.
- Function Before/After Actions ( for Mask plugins,Design etc...)
## Log:
- v0.0.3
	1. get data of table.
	2. save/delete via AJAX.
	3. fix some bugs
- v0.0.2:
	1. add new property unchecked.
	2. checkbox accepts boolean/string/numbers.
 
## Installation

 Include css file if you're interested by it (not required) in your HTML code.
	
    <link rel="stylesheet" href="/dist/ediTable.min.css" type="text/css" /> 

Include Libs in your HTML code:

	<script src="/lib/jquery.js"></script> 
	<script src="/dist/ediTable.min.js"></script>

## Usage
 - Creating table via JSON :
 
			<table>
			</table>
			<script>
				$("table").ediTable({
					json:
						{
							body:jsonArray,
						},
					});		
			</script>

 - Creating table via HTML
			
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
					</tr>
				</thead>
				<body>
					<tr>
						<td data-index="id">1</td>
						<td data-index="name">Med</td>
					</tr>
				</body>
			</table>
			<script>
				$("table").ediTable();		
			</script>
Note: you need to set name of each field in attr "data-index" of your TDs
 - Creating table via (HTML/JSON)
			
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
					</tr>
				</thead>
				<body>
					<tr>
						<td data-index="id">1</td>
						<td data-index="name">Med</td>
					</tr>
				</body>
			</table>
			<script>
				$("table").ediTable({
					json:
						{
							body:jsonArray,
						},
					});		
			</script>
Note: you need to set name of each field in attr "data-index" of your TDs
			
## Options
|Name|Type| Default |Description|
|--|--|--| --|
| editable | boolean | true | make table editable |
| sortable | boolean | false | make table sortable |
| json     | Object | ------ | create and define columns (type, title)  |
| button | Object | ------ | add edit, delete & costum buttons |
| add | boolean | false | add new row |
| keyboard| bool | true | allow Esc/Enter canceling/saving row|
| beforeSave | Function| ------ | before switching to save mode |
| afterSave | Function| ------ | after switching to save mode |
| beforeEdit| Function| ------ | before switching to edit mode  |
| afterEdit| Function| ------ | after switching to edit mode |
| beforeDelete| Function| ------ | before switching to delete mode |
| afterDelete | Function| ------ | after switching to delete mode|
| requiredAction | Function| ------ | action on required error|
| invalidAction | Function| ------ | action on invalid error|

Note:
- double click if you wanna edit row.
- click on the last row to add new one ( set add:true )
# Extra Information
## JSON object
json option has 2 arrays, head & body:
1. head is empty array by default and its role is defining columns:
			 -E.G:
					 
		 //...
		 json:{
			 head:
			 [
				{
					title:"Column 1", // TH tag(string), default is name property 
					type:"number", // default text
					validation:false, //default true,
					required:false, //default true
					min:-5, // works with only (number)
					max:5, // works with only (number)
					editable:false //default true
				},
				{
					title:"Column 2", 
					type:"checkbox",
					checked:"x", // all cells with x value will be checked // required property
					unchecked:"y",
					label:function($value){ // $value return value1 (x) or value2  
						if($value==something)
							return "label1" // e.g : "Active"/"paid"...
						return "label2" // e.g : "Unactive"/"unpaid"...
					},
					editable:true,
				},
				{
					type:"select",
					data:	// required property
					[
						{
							value:0,
							label:"male"
						},
						{
							value:1,
							label:"female"
						}
					],
				},
				{
					title:"Pic profil",
					type:"image", // non-editable
				},
			 ]
		 }
	Note: if you don't wanna define some column, you need to set it ,{},

		//...
		{
			title:"X",
			type:"type1"
		},
		{}, // if you don't wanna define this column.
		{
			title:"Y",
			type:"type2"
		},
2. body is empty array by default and its where you set your data (JSON data):
e.g:
		
		json:{
			body:
			[
				//...
				{
					id:70,
					name:"Med",
					birthday:"1789-01-04",
					//...
				}
				//...
			]
		}
## Button object
Button is object where you can set your costum buttons or active edit/delete buttons, it has 2 objects, edit & delete button with default values :
1. edit/delete objects:
			 -E.G:
			 
			 //...
			 button:
			 {
				edit:
				{
					active:true, // default: false
					text:"<i class="far fa-edit"></i>", // default: edit  (text when row in show mode)
					textActive:"<i class="far fa-save"></i>", // default: edit (text when row in edit mode)
					selector:"editButton", // class, default: edit
				},
				delete:
				{
					active:true, // default: false            //required property
					text:"<i class="fas fa-trash-alt"></i>", // default: delete
					selector:"deleteButton", // class, default: delete
				},
				title:"Costum Title" // TH of column  default : Actions
			 }
			 //...
2. creating custom button:


		//...
		customButton1:
			{
				active:true,
				text:"whatever",
				//textActive:"", // you can use it if you wanna change button's text in the edit mode.
				selector:"customButtonSelector",
				action:function(values,tr) // action on click.
				{
					// some logic 
				}
			}
		//...
		
## Save 
1. Save via Ajax (by row) using jquery function $.ajax
		
		//...
		afterSave:function(values,oldvalues){
			formdata=new FormData();
			$.each(values,function(index,cellValue){
				formdata.append(index,cellValue);
			});
			$.ajax({
				url:"/path/serverFile[.extension]",
				data:formdata,
				type:"method",
				success:function(resp){}
			});
		},
		
2. Delete via Ajax (by row) using jquery function $.ajax
		
		//..
		afterDelete:function(values)
		{
			$.ajax({
				url:"/path/serverFile[.extension]",
				data:{id:values._id},
				success:function(resp){}
			});
		}
		//...
3. Get the table data
	- ediTable library applied on a single table :	

			<table id="table1"></table>
			<table id="table2"></table>
			<table id="table3"></table>
			var table=$("#table1").ediTable({[...]});
			table.data();
	- ediTable library applied on multi tables : 
			
			<table id="table1"></table>
			<table id="table2"></table>
			<table id="table3"></table>
			var table=$("table").ediTable({[...]});
			index = 0; // 0 => first table | 1 => second table | ...
			table.data(index); //index of table 0,1,2...
## Columns Types
Types of columns inputs.

|Name/Properties|validation| editable |required|title|data|label|min|max|checked|unchecked|
|--|--|--|--|--|--|--|--|--|--|--|
| text||✓|✓|✓|||||||
| checkbox||✓||✓||✓|||✓|✓|
| number|✓|✓|✓ |✓|||✓|✓|||
| image ||||✓|||||||
| select ||✓|✓|✓|✓||||||
| url |✓|✓|✓|✓|✓||||||
| color|✓|✓|✓|✓|||||||
| email |✓|✓|✓|✓|||||||
## Methods Arguments

	beforeSave:function(values,$tr){},

	afterSave:function(newValues,oldValues,$tr){},

	beforeEdit:function(values,$tr){},

	afterEdit:function(values,$tr){},

	beforeDelete:function(values,$tr){},

	afterDelete:function(values,$tr){},

# Contact
- any bug/issue you fall in you can report it.
- any suggest contact me.
