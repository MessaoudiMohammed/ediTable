
jsonObject=[
    {
      "_id": "5ca1087e68d9ef80d9368a13",
      "date": "1995-10-22",
      "src": "http://placehold.it/32x32",
      "isActive": 17,
      "picture": "http://placehold.it/32x32",
      "age": 36,
      "eyeColor": "#0000ff",
      "name": "Rita Farmer",
      "gender": "1",
      "company": "BRAINQUIL",
      "email": "ritafarmer@brainquil.com",
      "phone": "+1 (884) 429-2017"
    },
    {
      "_id": "5ca1087e02a391cfaa78b232",
      "date": "1995-10-22",
      "src": "http://placehold.it/32x32",
      "isActive": 11,
      "picture": "http://placehold.it/32x32",
      "age": 34,
      "eyeColor": "#AABB00",
      "name": "Mae Ashley",
      "gender": "1",
      "company": "EARTHPLEX",
      "email": "maeashley@earthplex.com",
      "phone": "+1 (979) 454-3761"
    },
    {
      "_id": "5ca1087e3ca2eda2dee7132b",
      "date": "1995-10-22",
      "src": "http://placehold.it/32x32",
      "isActive": 11,
      "picture": "http://placehold.it/32x32",
      "age": 35,
      "eyeColor": "#AABB00",
      "name": "Cherry Atkinson",
      "gender": "0",
      "company": "ANDERSHUN",
      "email": "cherryatkinson@andershun.com",
      "phone": "+1 (874) 466-2263"
    },
    {
      "_id": "5ca1087e83fcc8209bdcfd4b",
      "date": "1995-10-22",
      "src": "http://placehold.it/32x32",
      "isActive": 11,
      "picture": "http://placehold.it/32x32",
      "age": 25,
      "eyeColor": "#AABB00",
      "name": "Ofelia Mcbride",
      "gender": "1",
      "company": "EMPIRICA",
      "email": "ofeliamcbride@empirica.com",
      "phone": "+1 (968) 496-3081"
    },
    {
      "_id": "5ca1087ecc61081314ce4778",
      "date": "1995-10-22",
      "src": "http://placehold.it/32x32",
      "isActive": 11,
      "picture": "http://placehold.it/32x32",
      "age": 39,
      "eyeColor": "#AABB00",
      "name": "Megan Mccarty",
      "gender": "1",
      "company": "ELPRO",
      "email": "meganmccarty@elpro.com",
      "phone": "+1 (897) 517-2836"
    },
    {
      "_id": "5ca1087e422d67dc53057d7c",
      "date": "1995-10-22",
      "src": "http://placehold.it/32x32",
      "isActive": 11,
      "picture": "http://placehold.it/32x32",
      "age": 31,
      "eyeColor": "#AABB00",
      "name": "Meyer Whitaker",
      "gender": "0",
      "company": "INJOY",
      "email": "meyerwhitaker@injoy.com",
      "phone": "+1 (958) 439-3232"
    },
    {
      "_id": "5ca1087e9d802220a0cec11d",
      "date": "1995-10-22",
      "src": "http://placehold.it/32x32",
      "isActive": 17,
      "picture": "http://placehold.it/32x32",
      "age": 34,
      "eyeColor": "#0000ff",
      "name": "Lolita Rush",
      "gender": "1",
      "company": "OTHERSIDE",
      "email": "lolitarush@otherside.com",
      "phone": "+1 (984) 459-2974"
    }
  ];


var x=$(".ediTable").ediTable(
    {
        json:
        {
            head:
            [
                {
                    title:"ID",
                    type:"text",
                    editable:false,

                },
                {
                    title:"Date",
                    type:"date",
                    validation:true

                },
                {
                    title:"Pic profil",
                    type:"image",
                    
                },
                {
                    title:"Active",
                    type:"checkbox",
                    checked:17,
                    unchecked:11,
                    label:function($result){
                        if($result==17)
                        {
                            return "Active";
                        }
                        return "Unactive";
                    },
                    validation:true
                },
                {
                    title:"Web site",
                    type:"url",
                    validation:true
                },
                {
                    title:"Age",
                    type:"number",
                    validation:true
                },
                {
                    title:"Eye Color",
                    type:"color",
                },
                {
                    title:"Name Complete",
                    type:"text",
                    validation:true
                },
                {
                    title:"gender",
                    type:"select",
                    data:
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
                    title:"Company",
                    type:"text",
                    validation:true,
                    required:true,
                },
                {
                    title:"Email",
                    type:"email",
                    validation:true,
                    classes:"fa dfgdfg dfsg dsfg",
                },
                {
                    title:"Phone",
                    type:"tel",
                },
            ],
            body:jsonObject,
        },      
        button:{
            edit:{
                active:true,
                text:"<i class=\"far fa-edit\"></i>",
                textActive:"<i class=\"far fa-save\"></i>",
                selector:"edit",
            },
            delete:{
                active:true,
                text:"<i class=\"fas fa-trash\"></i>",
                selector:"delete", // class
            },
            show:{
                active:true,
                text:"<i class=\"fas fa-eye\"></i>",
                selector:"show", // class
                action:function($values){
                    //location.href=$($row).children("td:first-child").text()+"/show/";
                }
            },
        },
        addRow:true,
        sortable:true,
        keyboard:true,
        // requiredAction:function($inputs){
        // },
        // invalidAction:function($inputs){
        // }
        afterSave:function(values,oldvalues){
            console.log(values);
          }
    }
);
