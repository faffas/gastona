/*
Copyright (C) 2018 Alejandro Xalabarder Aulet
License : GNU General Public License (GPL) version 3

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.
*/

/**
   @author Alejandro Xalabarder
   @date   2018.05.29

   @file   zWidgetsHtml.js

   @desc
      zWidgets based on html + Css


               'd': // div
               'n': // link (login ?)
               'b': // button
               'e': // text input
               'u': // upload file selector
               'm': // image
               'p': // password
               'h1': header
               'h2': header
               'h3': header
               'l': // label
               'x': // text area
               't': // simple table
               'c': // combo
               'r': // radio group
               'k': // checkbox group
               'i': // list

*/

//"use strict";

function zWidgets (htmlStamm, laData, mensaka)
{
   "use strict";

   var javajzWidgets = {};

   return {
      // public functions to export

      addWidget          : addWidget,
      deliverMsgToWidget : deliverMsgToWidget,
      defaultSize4widget : defaultSize4widget,
      doMoveWidget       : doMoveWidget,
      doShowWidget       : doShowWidget,

   };

   function str2lineArray (str) { return str.replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/\r/); }


   function getIdValue (id)
   {
      var ele = document.getElementById(id);
      return (ele) ? ele.value : getDataCell (id);
   }

   function getWidgetByName (widName)
   {
      return javajzWidgets[widName];
   }

   //alias
   function getzWidgetByName (nam) { return getWidgetByName (nam); }

   function deliverMsgToWidget (wname, msg)
   {
      var zwidget = getWidgetByName (wname);
      if (! zwidget) return false;

      if (zwidget[msg]) {
         zwidget[msg] (); // update data
         return true;
      }
      alert ("ERROR (updateWidget) zwidget /" + zwidget.id + "/ with no 'data!' message");
      return false;
   }

   function defaultSize4widget (wname, oRect)
   {
      // try to estimate default size (height & width) for the element
      //
      if (!oRect)
      {
         var ele = document.getElementById(wname);
         if (ele)
         {
            var height = (ele.offsetHeight + 1);
            var width  = (ele.offsetWidth + 1);

            //console.log ("element " + wname + " content[" + ele.innerHTML + "] estimates " + width + " x " + height);

            if (height > 1)
               oRect = { left: 0, right: width * 1.2, top: 0, bottom: height * 1.2 };
         }
      }
      return oRect ;
   }

   function doMoveWidget (wname, x, y, dx, dy)
   {
      // css position and size
      //
      var ele = document.getElementById(wname);
      if (ele)
      {
         ele.style.position = "absolute";
         ele.style.left   = Math.round(x) + "px";
         ele.style.top    = Math.round(y) + "px";
         ele.style.width  = Math.round(dx) + "px";
         ele.style.height = Math.round(dy) + "px";
      }
      else console.log ("ERROR expected html element " + wname + " not found!");
   }

   function doShowWidget (wname, bShow)
   {
      // css visibility
      //
      var elm = document.getElementById(wname);
      if (elm)
      {
         //don't work on IE ... sometimes ???
         //elm.style.display = bShow ? "inline-block" : "none";
         elm.style.visibility = bShow ? "visible" : "hidden";
      }
   }

   function strStartsWith (s1, s2, pos)
   {
      pos = pos || 0;
      return s1.indexOf(s2, pos) === pos;
      //return s1.slice(0, s2.length) === s2;

      // thisdoes not work for IE8, 9
      //
      //if (!String.prototype.startsWith) { String.prototype.startsWith = function(seas, pos) { pos = pos || 0; return this.indexOf(seas, pos) === pos; }; }
   }

   // --------- START PART widgetFactory
   //

   // function htmlElem (elmeOrId)
   // {
   //    if (typeof elmeOrId === "string")
   //       return document.getElementById (elmeOrId);
   //    return elmeOrId;
   // }

   function setValueToElement (element, valueStr)
   {
      if (element)
      {
         if (typeof element.value === "string")
              element.value = valueStr;
         else element.innerHTML = valueStr;
      }
   }

   function addWidget (name)
   {
      if (! name || name.length == 0) return;

      var zwid;

      //  var2Text ("eThisIsAText")); ==> "This Is A Text"
      //  var2Text ("eThis_is_a_text")); ==> "This is a text"
      function var2Text (name)
      {
         if (name.length <= 2) return "";
         var sal = name[1];

         for (var ii = 2; ii < name.length; ii ++)
         {
            if (name[ii] == '_')
              sal += " ";
            else {
               if (name[ii] < 'Z' && sal[sal.length-1] != ' ')
                  sal += " ";
               sal += name[ii];
            }
         }
         return sal;
      }

      var updateSimpleLabel = function () {
         this.innerHTML = (laData.dataUnit[name] ? laData.getDataCell (name) : var2Text (name));
      }
      var updateSimpleLabel2 = function () {
         this.innerHTML = (laData.dataUnit[name] ? laData.getDataCell (name) : var2Text (name.substr(1)));
      }
      var updateSimpleValue = function () {
         setValueToElement (this, laData.getDataCell (name));
      }
      var updateSimpleSrc = function () {
         this.src = laData.getDataCell (name);
      }
      var updateResetValue = function () {
         this.value = '';
      }
      var updateImage = function () {
         // this.src = laData.getDataCell (name);
         //console.log ("setting background image for " + name + " [" + laData.getDataCell (name) + "]");
         this["style"]["background-image"] = "url('" + laData.getDataCell (name) + "')";
      }

      var signalName = function () {
         mensaka(name);
      }
      var assignValue = function () {
         laData.dataUnit[name][0] = [ this.value||"?" ];
         signalName ();
      };
      var assignText = function ()
                       {
                           laData.dataUnit[name] = [ [ ] ];
                           var text = this.value||"?";
                           var rows = str2lineArray (text);
                           for (var rr in rows)
                              laData.dataUnit[name][rr] = [ rows[rr] ];

                           signalName ();
                       };

      var hayClassOf = laData.dataUnit["class of " + name];
      var widgetclass = hayClassOf ? hayClassOf[0][0] : name;

      switch (widgetclass.charAt (0))
      {
         case 'd':
            zwid = fabricaStandard ("div", name, { "data!": updateSimpleLabel  } );
            break;
         case 'n':
            zwid = fabricaStandard ("a", name, { href: "login", "data!": updateSimpleLabel } );
            break;
         case 'b':
            zwid = fabricaStandard ("button", name, { onclick: signalName, "data!": updateSimpleLabel } );
            break;
         case 'e':
            zwid = fabricaStandard ("input", name, { type: "text", onchange: assignValue, placeholder: var2Text(name), "data!": updateSimpleValue } );
            break;

         // --- Note about widget class for submit button
         //    this could be handled with an extra widget class, implementing it as
         //    zwid = fabricaStandard ("input", name, { type: "submit", ...
         //    but this is not necessary since we can use a button ('b') and set its property "type" to submit
         //    for example
         //          <bSendIt type> //submit


         // --- Note about upload (choose file) widget class
         // As stated by the Chrome error message if we try to set a value different than empty string to this element
         // "Failed to set the 'value' property on 'HTMLInputElement': This input element accepts a filename, which may only be programmatically set to the empty string."
         //
         case 'u':
            zwid = fabricaStandard ("input", name, { type: "file", onchange: signalName, "data!": updateResetValue } );
            break;

         case 'm': // image
            // zwid = fabricaStandard ("img", name, { "data!": updateImage } );
            zwid = fabricaStandard ("div", name, { onclick: signalName, "data!": updateImage } );
            zwid.style["background-position"] = "center center";
            zwid.style["background-repeat"] = "no-repeat";
            zwid.style["background-size"] = "contain";
            break;

         case 'p': // password
            zwid = fabricaStandard ("input", name, { type: "password", placeholder: "password", onchange: assignValue, "data!": updateSimpleValue } );
            break;

         //(o) TOCHECK: some strange thing happen when two h's are put beside in EVALAYOUT
         case 'h':
            if (widgetclass.length >= 2)
               zwid = fabricaStandard ("h" + widgetclass.charAt (1), name, { "data!": updateSimpleLabel2 } );
            break;

         case 'l':
            zwid = fabricaStandard ("label", name, { "data!": updateSimpleLabel } );
            break;

         case 'x':
            {
               var updata = function () {
                     var tex = "", row;
                     if (!laData.isEvaEmpty (laData.dataUnit[this.id]))
                        for (row in laData.dataUnit[this.id])
                           tex += laData.dataUnit[this.id][row] + "\n";
                     setValueToElement (this, tex);
                  }
               zwid = fabricaStandard ("textarea", name, { placeholder: var2Text(name), "data!": updata, onchange: assignText } );
            }
            break;


         case 't': // simple table
            {
               var updata = function () {
                     var etabla, rowele, colele, row, col, evaData = laData.dataUnit[this.id];

                     // create new html table
                     while (this.hasChildNodes())
                     {
                        this.removeChild(this.firstChild);
                     }

                     etabla = document.createElement ("table");
                     etabla["id"] = this.id + "-table"; // e.g <div id="tMiTabla"> <table id="tMitabla-table">...

                     for (row in evaData)
                     {
                        if (laData.isEvaEmpty (evaData))
                        {
                           // row === "0" only one column and empty ==> no headers
                           // no headers!
                        }
                        else
                        {
                           rowele = document.createElement ("tr");

                           for (col in evaData[row])
                           {
                              colele = document.createElement (row === "0" ? "th": "td");

                              // use instead ? colele.value = evaData[row][col];
                              setValueToElement (colele, evaData[row][col]);
                              rowele.appendChild (colele);
                           }
                           etabla.appendChild (rowele);
                        }
                     }
                     this.appendChild (etabla);
                  }
               zwid = fabricaSimpleTable (name, { "data!": updata });
            }
            break;

         case 'c': // combo
         case 'r': // radio group
         case 'k': // checkbox group
         case 'i': // list
            {
               var labels = [], values = [];
               var indxLabel = 0, indxValue = 0;

               // Now assume list of "value, label" for the data (with column names in the first row!)
               //
               for (var row in laData.dataUnit[name])
               {
                  if (row === "0")
                  {
                     indxLabel = laData.dataUnit[name][row].indexOf ("label");
                     if (indxLabel == -1) indxLabel = 0;
                     indxValue = laData.dataUnit[name][row].indexOf ("value");
                     if (indxValue == -1) indxValue = 0;
                  }
                  else
                  {
                     values.push (laData.dataUnit[name][row][indxValue]||"?");
                     labels.push (laData.dataUnit[name][row][indxLabel]||"?");
                  }
               }
               var orient = laData.dataUnit[name + " orientation"]||"X";

               //(o) TODO/jGastona/fabrica_zWidgets why not ?  zwid = fabricaSelectList (...

               if (name.charAt (0) == 'c')
                  htmlStamm.appendChild (fabricaSelectList (name, values, labels, false));
               if (name.charAt (0) == 'i')
                  htmlStamm.appendChild (fabricaSelectList (name, values, labels, true));
               if (name.charAt (0) == 'r')
                  htmlStamm.appendChild (fabricaGrupo ("radio", orient, name, values, labels));
               if (name.charAt (0) == 'k')
                  htmlStamm.appendChild (fabricaGrupo ("checkbox", orient, name, values, labels));
            }
            break;
      }

      if (zwid)
      {
         // collect it
         javajzWidgets[name] = zwid;
         htmlStamm.appendChild (zwid);

         deliverMsgToWidget (name, "data!");

         // experimental! all widgets need data!
         if (!laData.dataUnit[name])
            laData.dataUnit[name] = [ [ "" ] ];
      }
   }

   // converts a string into a "string", "object" or js "function"
   // var str = str2jsVar ("\"sisie");
   // var arr = str2jsVar ("[ 'sisie', 'nono', 234, [1, 2] ]");
   //
   function str2Var (str)
   {
      var str2 = "";
      if (typeof str !== "string")
      {
         // array of strigs = text ?
         //
         str2 = str.join ("\n");
      }
      else str2 = str;

      // old style string (to be deprecated!)
      //
      if (str2.match(/^\s*[\"\']/))
         return str2.substr(1);

      // array [] or object {}
      //
      if (str2.match(/^\s*[\[\{]/))
         return eval ("(function () { return " + str2 + ";}) ()");

      // simply as string
      return str2;
   }

   function strStartsWith (s1, s2, pos)
   {
      pos = pos || 0;
      return s1.indexOf(s2, pos) === pos;
      //return s1.slice(0, s2.length) === s2;

      // thisdoes not work for IE8, 9
      //
      //if (!String.prototype.startsWith) { String.prototype.startsWith = function(seas, pos) { pos = pos || 0; return this.indexOf(seas, pos) === pos; }; }
   }

   function fabricaStandard (typestr, name, atts)
   {
      var ele = document.createElement (typestr);   // "label" "button" etc
      ele["id"] = name;
      ele.style.visibility = "hidden";
      ele.spellcheck = false; // per default FALSE !!!
      for (var aa in atts)
      {
         ele[aa] = atts[aa];
      }

      // ensure a variable in data unit if not already exists
      // for the value (NOTE: for some reason it does not work for typestr === "textarea")
      if (typestr === "input" && !laData.dataUnit[name])
         laData.dataUnit[name] = [[ "" ]];

      // Interpret attributes of element as follows
      //
      //                           action to do
      //    <elem onXXXX>  val     elem.onXXXX = val (function)
      //    <elem class>   val     elem.className = val
      //    <elem +class>  val     elem.className += (" " + val)
      //    <elem other>   val     elem.other = val
      //

      for (var dd in laData.dataUnit)
      {
         // i.e. <eText class> //'btn
         // i.e. <eText onchange> //alarm("me change!");
         if (strStartsWith (dd, name + " "))
         {
            var attrib = dd.substr(name.length + 1);
            var value = laData.dataUnit[dd];

            if (strStartsWith (attrib, "on")) {
               // notification to some event (e.g. "onkeyup", "onwheel" etc)
               //
               ele.addEventListener (attrib.substr(2),
                     function () {
                        // we must ensure that data of widget is reflected in dataUnit
                        // before doing anything with it for example "onkeyup" may occur before an
                        // onchange which sets automatically the data to the dataUnit
                        if (attrib !== "onchange" && ele["onchange"])
                              ele.onchange ();
                        eval (str2Var (value));
                     });
            }
            else if (attrib == "class") {
               ele.className = value;
            }
            else if (attrib == "+class") {
               ele.className += (" " + value);
            }

            try {
               // This try catch is only due to IE11, for example if value is "date"
               // it would cause "invalid argument" error and NOTHING will be shown
               // this may happen in more places, should we do a try catch erverywhere !?
               //
               ele[attrib] = str2Var (value);
            } catch (err) {}
         }
      }

      // if (text)
      //   ele.appendChild (document.createTextNode(text));

      return ele;
   }

   //== selectAllColumnsFromTable
   // <mytable>
   //        value, name          , phone
   //        01   , my first name , 88888
   //        02   , second        , 77777
   //
   // selectAllColumnsFromTable (unit, "mytable", "01");
   // produces setting the variables
   //
   //    <mytable selected.id> 01
   //    <mytable selected.name> my first name
   //    <mytable selected.phone> 88888
   //
   function selectAllColumnsFromTable (unit, name, strvalue)
   {
      if (!unit || !unit[name] || !unit[name][0]) return false;
      var colnames = unit[name][0];

      var indxVal = colnames.indexOf ("value");
      if (indxVal === -1) indxVal = 0;

      // clean all <name selected.column> variables
      for (var col in colnames)
         delete unit[name + " selected." + colnames[col]];

      //search the row with the value (unique id) at position 0
      for (var rosel = 1; rosel < unit[name].length; rosel ++)
      {
         if (unit[name][rosel][indxVal] === strvalue)
         {
            for (var col in colnames)
               unit[name + " selected." + colnames[col]] = [[ unit[name][rosel][col]||"?" ]];

            return true;
         }
      }
      return false;
   }

   // set all the variables for all column names <name seleted.columnname>
   // the single variable <name_value> and send the mensaka message "name"
   // or remove the variables if no value is selected (deselecting last item in a list)
   //
   function whenChangeTableSelection (name, value)
   {
      if (selectAllColumnsFromTable (laData.dataUnit, name, value||"?"))
           laData.dataUnit[name + "_value"] = [[ value||"?" ]]; // to have a single variable
      else delete laData.dataUnit[name + "_value"];
      mensaka(name)
   }

   // for lists and combos
   //
   function fabricaSelectList (name, arrOp, arrLab, ismultiple)
   {
      var ele = document.createElement ("select");
      if (ismultiple)
         ele["multiple"] = "si";

      ele["id"] = name;
      ele.style.visibility = "hidden";
      ele.addEventListener ("change", function () { whenChangeTableSelection (name, this.value); });
      for (var ite in arrOp)
      {
         var subele = document.createElement ("option");
         subele["value"] = arrOp[ite];
         subele["data!"] = function () { }; //(o) TOREVIEW_jGastona_update message in subelements, is it really needed ?

         subele.appendChild (document.createTextNode(arrLab[ite]));
         ele.appendChild (subele);
      }

      return ele;
   }

   // for checkbox and radio groups
   //
   function fabricaGrupo (tipo, orient, name, arrOp, arrLab)
   {
      var ele = document.createElement ("div");
      ele["id"] = name;
      ele.style.visibility = "hidden";

      // *** Own width calculation
      // we have to estimate width, for some reason if not specified
      // width (offsetWidth) per default is the whole width whereas the height is
      // correctly calculated from the content.
      var widthEstim = 0;

      //cannot do this here like in fabricaSelect, but to be done on each element
      //ele.addEventListener ("change", function () { whenChangeTableSelection (name, this.value); });
      for (var ite in arrOp)
      {
         var subele = document.createElement ("input");
         subele["type"] = tipo;
         subele["name"] = name;
         subele["value"] = arrOp[ite];
         subele["label"] = arrLab[ite];

         // a more accurate measure has to take into account the final font
         // which might be not know right now (?!)
         var estimW = 12 * subele["label"].length; // mean 12px per char

         subele["data!"] = function () { };
         subele.addEventListener ("change", function () { whenChangeTableSelection (name, this.value); });
         if (ite !== "0" && (orient == "Y" || orient == "V")) {
            ele.appendChild (document.createElement ("br"));
            widthEstim = Math.max (widthEstim, estimW);
         }
         else {
            widthEstim += estimW;
         }
         ele.appendChild (subele);
         ele.appendChild (document.createTextNode(arrLab[ite]));
      }
      ele.style.width = widthEstim + "px";

      return ele;
  }

  function fabricaSimpleTable (name, atts)
  {
      var ele = document.createElement ("div");
      ele["id"] = name;
      ele["widgetype"] = "t"; // to be used ...
      ele.style.visibility = "hidden";

      for (var aa in atts)
      {
         ele[aa] = atts[aa];
      }

      return ele;
   }

}
