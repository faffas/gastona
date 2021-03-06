/*
Copyright (C) 2015,2016,2017,2018 Alejandro Xalabarder Aulet
License : GNU General Public License (GPL) version 3

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.
*/

   ////////////////////
   // vec3
   ////////////////////


   function vec3(x, y, z) {
     this.x = x || 0;
     this.y = y || 0;
     this.z = z || 0;
   }

   vec3.prototype = {

      toString: function () {
         return this.x + ", " + this.y + ", " + this.z;
      },

      fromArray: function(arr, indx, dim) {
         dim = dim||3;
         var base = (indx||0)*dim;
         this.set (arr[base], arr[1+base], (dim > 2 ? arr[2+base]: 0));
      },

      setIntoArray: function(arr, indx, dim) {
         dim = dim||3;
         indx = indx||(arr.length/dim);
         var base = indx*dim;
         arr[base] = this.x;
         arr[base+1] = this.y;
         if (dim > 2)
            arr[base+2] = this.z;
      },

      plus: function(v2) {
         this.x += v2.x;
         this.y += v2.y;
         this.z += v2.z;
      },

      minus: function(v2) {
         this.x -= v2.x;
         this.y -= v2.y;
         this.z -= v2.z;
      },

      mult: function(b) {
         this.x *= b;
         this.y *= b;
         this.z *= b;
      },

      div: function(b) {
         if (b === 0) b=1e-20;
         this.x /= b;
         this.y /= b;
         this.z /= b;
      },

      dot: function(v2) {
         return this.x * v2.x + this.y * v2.y + this.z * v2.z;
      },

      cross: function(v2) {
         return new vec3(
            this.y * v2.z - this.z * v2.y,
            this.z * v2.x - this.x * v2.z,
            this.x * v2.y - this.y * v2.x
         );
      },

      norm: function() {
         return Math.sqrt(this.dot(this));
      },

      normalize: function() {
         this.div (this.norm ());
      },

      angle: function(a) {
         return Math.acos(this.dot(a) / (this.norm() * a.norm()));
      },

      clone: function() {
         return new vec3(this.x, this.y, this.z);
      },

      set: function(x, y, z) {
         if (x instanceof vec3) {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
         }
         else {
            this.x = x||0;
            this.y = y||0;
            this.z = z||0;
         }
      },
      // var v1 = new vec3(6, 0, 0);
      // var v2 = new vec3(0, 4, 0);
      //
      // var v3 = v1.cross (v2);
      //
      // v3.normalize ();
      //
      // v3.mult (7);
      //
      // var arras = [];
      //
      // v3.setIntoArray(arras, 0);
      // v1.setIntoArray(arras);
      // v2.setIntoArray(arras);
      //
      // var ss ="";
      // for (var ii in arras)
      //    ss += arras[ii] + ", ";
      //
      // ss + " v3 is " + v3.toString ();
   };

   function vec3FromTo (v1, v2) {
     var v3 = v2.clone ();
     v3.minus (v1);
     return v3;
   }

   function vec3FromArray (arr, indx, dim) {
     var v3 = new vec3 ();
     v3.fromArray (arr, indx, dim);
     return v3;
   }

function trazos2D ()
{
   var SVGNamespace = "http://www.w3.org/2000/svg";
   var DEFAULT_GRAPH_DX = 300;
   var DEFAULT_GRAPH_DY = 200;
   var graffitiPila = [];  // to avoid recurrent graffitis

   return {
      renderCanvasGraffitis : renderCanvasGraffitis,
      renderSvgGraffitis    : renderSvgGraffitis,
      renderClassGraffiti   : renderClassGraffiti,
      drawGraffiti2canvas   : drawGraffiti2canvas,
      trazoShape2canvas     : trazoShape2canvas,
      drawGraffiti2svg      : drawGraffiti2svg,
      trazoShape2svg        : trazoShape2svg,
      autoCasteljau         : autoCasteljau,
      convertPathArrayJ2C   : convertPathArrayJ2C,
   };

   ////////////////////
   // parse2DStyle
   ////////////////////

   function parse2DStyle (stylestr)
   {
      var reto = {};
      if (!stylestr) return reto;
      var atts = stylestr.split (';');
      if (!atts || atts.length === 0) return reto;


      var aliases = {
            op: "opacity",
            sc: "stroke",
            sw: "stroke-width",
            so: "stroke-opacity",
            fc: "fill",
            fr: "fill-rule",
            fo: "fill-opacity",
            font: "font-family",
            ff: "font-family",
            fof: "font-family",
            fs: "font-size",
            fos: "font-size",
            ft: "font-type",
            fot: "font-type",
      };

      for (var ii = 0; ii < atts.length; ii ++)
      {
         var atval = atts[ii].split (':');
         if (atval.length !== 2) continue;

         var name = atval[0].trim ();

         reto [aliases[name] || name] = atval[1].trim ();
      }

      return reto;
   }

   // function outobj(o)
   // {
   //    for (var ii in o) out (ii + " : [" + o[ii] + "]");
   // }
   //
   // outobj (parse2DStyle ());
   // outobj (parse2DStyle (""));
   // outobj (parse2DStyle ("fc : #9100fe"));
   // outobj (parse2DStyle ("     font: Cursava;   fc : #9100fe   "));
   // outobj (parse2DStyle (" stroke-width: 6 ; sc: #eeff03;    font: Cursava;   fc : #9100fe   "));
   //

   ////////////////////
   // autoCasteljau
   ////////////////////


   // convert an array 'jau' (autocasteljau) into a c curve (cubic)
   //    example
   //    out (ta.convertPathArrayJ2C (40, 10, false, [1, 2, 7, -2]));
   //  outpts
   //    39.75,9.5,39.78275799460319,12,41,12,42.21724200539681,12,46.25,10.5,48,10
   //
   function convertPathArrayJ2C (px, py, closePath, arrJ)
   {
      var au = autoCasteljau (px, py, closePath, arrJ);
      au.computePoints ();
      return au.getArrayCasteljau ().slice(2); // slice (2) to remove position 0, 0 (why is it included ?)
   }

   function autoCasteljau (x0, y0, close, arrPtos)
   {
      // from a starting point x0, y0 and and an array of relative displacements [ xr1, yr1, xr2, yr2, ... etc ]
      // a Casteljau or Bezier curve passing by all points is returned, being the control points
      // automatically calculated.

      var arrCasteljau = [];
      var arreglo = -1.; // either automatic (-1) or an adjust value between 0 and 1
      var MISTAD = 0.5;

      return {
         x0: x0,
         y0: y0,
         arrPtos: arrPtos,
         computePoints: computeAutoCasteljau,
         getArrayCasteljau: function () { return arrCasteljau; } ,

         //move: function (indx, dx, dy) { }
         //insert:
         //remove:
         //
      };

      function computeAutoCasteljau ()
      {
         if (!arrPtos || arrPtos.length < 2) return [];

         // ctrl      c0  c1   c2  c3    c4  c5
         // ptos    0        1        2          3
         //
         var NP = 3 * (2+arrPtos.length) - 4; // final length of point plus control points
         var ctrl;
         var posa = 0;
         arrCasteljau = [];

         var prev = new vec3 ();
         var p1 = new vec3 (x0, y0);
         var p2 = new vec3 ();
         var p3 = new vec3 ();

         for (var ii = 0; ii < arrPtos.length - 3; ii += 2)
         {
            if (ii > 0)
               p1.fromArray (arrPtos, ii/2 -1 , 2);
            p2.fromArray (arrPtos, ii/2 + 0, 2);
            p3.fromArray (arrPtos, ii/2 + 1, 2);

            // all points are relative to the previous
            p1.plus (prev);
            p2.plus (p1);
            p3.plus (p2);
            prev.set (p1.x, p1.y, p1.z); // new previous

            ctrl = getControlPoints (p1, p2, p3);

            // we set the point and the two control points of the next point!
            //
            // ctrl       ?1  s2    s4
            // ptos    s0        ?3
            //
            p1.setIntoArray      (arrCasteljau, posa+0, 2);
            ctrl[0].setIntoArray (arrCasteljau, posa+2, 2);
            ctrl[1].setIntoArray (arrCasteljau, posa+4, 2);
            posa += 3;
         }

         // calculate extrem control points
         //
         if (close)
         {
            // we need two more control points, between last and first point
            // plus repeat the first point at the end! (3*2 = 6)
            NP += 6;

            // ctrl                   c0    c1   ?0    ?1  ?2     ?3
            // ptos      ...    p1       p2         p3         0
            // new p1           x-->                           p1 (new)

            // reuse p2 and p3 and change p1
            p1 = new vec3 (x0, y0);
            ctrl = getControlPoints (p2, p3, p1);  // note the order!  2-3-1

            p2.setIntoArray      (arrCasteljau, posa+0, 2);  // p2
            ctrl[0].setIntoArray (arrCasteljau, posa+2, 2);  // ?0
            p3.setIntoArray      (arrCasteljau, posa+3, 2);  // p3   last real point
            ctrl[1].setIntoArray (arrCasteljau, posa+4, 2);  // ?1

            // ctrl     c0    c1   ?0    ?1  ?2    ?3    c    c
            // ptos       --         p3         p1         p2

            // reuse p3, p1 and change p2
            p2.fromArray (arrPtos, 0, 2); // point at index 1
            p2.plus (p1); // add the point 0 since is relative to it!

            ctrl = getControlPoints (p3, p1, p2);  // note the order!  3-1-2

            ctrl[0].setIntoArray (arrCasteljau, posa+5, 2); // very last control point   (left from point at index 0)
            p1.setIntoArray      (arrCasteljau, posa+6, 2); // repeat the first point at the end
            ctrl[1].setIntoArray (arrCasteljau,     1 , 2); // very first control point  (right from point at index 0)
         }
         else
         {
            // ctrl      ?   c1   c2 c3   c4 ?
            // ptos    0        1       2      3
            //                  p1      p2     p3

            //--- very last control point
            //
            // extend "p4" = p3 + (p3-p2)
            p1 = p3.clone ();
            p1.plus (vec3FromTo (p2, p3));

            ctrl = getControlPoints (p2, p3, p1);  // note the order!  2-3-1
            p2.setIntoArray      (arrCasteljau, posa+0, 2);  // p2
            ctrl[0].setIntoArray (arrCasteljau, posa+2, 2);  // ?0
            p3.setIntoArray      (arrCasteljau, posa+3, 2);  // p3   last real point

            //--- very first control point
            //
            // get p1, p2 and extend "p-1" = p1 + (p1-p2)
            //
            p1.set (x0, y0);         // point at index 0
            p2.fromArray (arrPtos, 0, 2); // point at index 1
            p2.plus (p1); // add the point 0 since is relative to it!
            p3 = p1.clone ();
            p3.plus (vec3FromTo (p2, p1));
            ctrl = getControlPoints (p3, p1, p2);
            ctrl[0].setIntoArray (arrCasteljau,  1 , 2); // very first control point  (right from point at index 0)
         }
         if (NP !== arrCasteljau.length)
            alert ("Error calculating final array NP " + NP + " !== " + (arrCasteljau.length));

         return arrCasteljau;
      }

      // given 3 points p1, p2, p3 it returns the two cotrol points of the middle point p2 !
      //
      //          c1
      //           ...p2      c2
      //        ...     ......
      //    p1..              ..........
      //                               ....p3
      //
      // ctrl       ?  s1    s2    ?
      // ptos    p1       p2          p3
      //
      function getControlPoints (p1, p2, p3)
      {
         var cp0 = new vec3 ();
         var cp1 = new vec3 ();

         var v1 = vec3FromTo (p1, p2);
         var v2 = vec3FromTo (p3, p2);

         var n1 = v1.norm ();
         var n2 = v2.norm ();
         var fator = (n1 + n2) * (n1 + n2);

         var dir = vec3FromTo (v2, v1);
         if (fator > 0)
            dir.div (fator);

         // faco1 makes the curve very curly in edges
         var faco1 = n1 > n2 ? n1 * n1: n2 * n2;

         // faco2 makes the curve quite flat
         var faco2 = n1 * n2;

         // atomatic arreglo : the more difference in distance the more faco2, if not more faco1
         var prop = n2 > 0 ? n1 / n2: 1;
         if (arreglo < 0.) arreglo = (prop > 1. ? 1./prop: prop);

         dir.mult (MISTAD * (arreglo * faco1 + (1 - arreglo) * faco2));

         cp0.set (p2);
         cp1.set (p2);

         cp0.minus (dir);
         cp1.plus  (dir);

         return [ cp0, cp1 ];
      }
   }; // ======= end of autoCasteljau

   ///////////////////////////////////
   // trazos - bounding box and autofit (autoscale)
   ///////////////////////////////////

   function boundingBoxAndAutoScale (trazos, width, height, marginPercent)
   {
      marginPercent = marginPercent || 10;

      // auto scale, offset and center image
      //
      var bounds = calcBoundingBox (trazos);

      // NOTE ABOUT width and height for scaling
      //
      // canvasElem.width and height from canvas itself (what we want)
      // canvasElem.clientWidth and clientHeight from graffiti class elements (final aspect)

      var scalex = width * (1 -2 * marginPercent / 100) / bounds.dx;
      var scaley = height * (1 -2 * marginPercent / 100) / bounds.dy;
      if (scalex < scaley)
           scaley = scalex;
      else scalex = scaley;

      return {
         scalex: scalex,
         scaley: scaley,
         offsetx: -bounds.x + (marginPercent / 100) * bounds.dx,
         offsety: -bounds.y + (marginPercent / 100) * bounds.dy,
      };
      // center ? this don't work ...
      //c2d.translate (canvasElem.clientWidth / (2*scalex) - bounds.x0 + bounds.dx/2,
      //               canvasElem.clientHeight / (2*scaley) - bounds.y0 + bounds.dy/2;
   }

   function calcBoundingBox (trazos)
   {
      var xx, yy, ii;
      var x0 = null, y0, x1, y1;

      function computePair (x, y) {
         if (x0 == null)
         {
            x0 = x;
            y0 = y;
            x1 = x+1;
            y1 = y+1;
            return;
         }
         if (x < x0) x0 = x;
         if (x > x1) x1 = x+1;   // avoid dx == 0
         if (y < y0) y0 = y;
         if (y > y1) y1 = y+1;   // avoid dy == 0
      }

      function compute (trazo) {
         xx = +(trazo[1]);
         yy = +(trazo[2]);
         computePair (xx, yy);
         for (ii = 5; ii+1 < trazo.length; ii += 2)
         {
            xx += +(trazo[ii]);
            yy += +(trazo[ii+1]);
            computePair (xx, yy);
         }
      }

      for (var tt in trazos) {
         if (trazos[tt][0] === 'z')
            compute (trazos[tt]);
      }

      return { x: x0, y: y0, dx: (x1-x0), dy: (y1-y0) };
   }

   ///////////////////////////////////
   // trazos - graffiti 2 canvas
   ///////////////////////////////////

   function trazoShape2canvas (c2d, form, px, py, pathStyle, closep, arrp)
   {
      c2d.beginPath();
      c2d.moveTo(px, py);

      var relative = true;
      var xx = +(px), yy = +(py);

      if (form === "jau") {
         var curv = autoCasteljau (+(px), +(py), closep, arrp);
         curv.computePoints ();
         var cc = curv.getArrayCasteljau ();

         for (var ii = 2; ii+5 < cc.length; ii += 6)
            c2d.bezierCurveTo (cc[ii], cc[ii+1], cc[ii+2], cc[ii+3], cc[ii+4], cc[ii+5]);
      }
      else {
         for (var ii = 0; ii < arrp.length; ii += 2)
         {
            var plusx = relative ? xx : 0;
            var plusy = relative ? yy : 0;

            if (form === "pol") {
               xx = +(arrp[ii+0]) + plusx;
               yy = +(arrp[ii+1]) + plusy;

               c2d.lineTo (xx, yy);
            }
            else if (form == "qua") {
               xx = +(arrp[ii+2]) + plusx;
               yy = +(arrp[ii+3]) + plusy;
               c2d.quadraticCurveTo (+(arrp[ii]) + plusx, +(arrp[ii+1]) + plusy, xx, yy);
               ii += 2;
            }
            else if (form == "cub" || form == "bez") {
               xx = +(arrp[ii+4]) + plusx;
               yy = +(arrp[ii+5]) + plusy;
               c2d.bezierCurveTo (+(arrp[ii]) + plusx, +(arrp[ii+1]) + plusy, +(arrp[ii+2]) + plusx, +(arrp[ii+3]) + plusy, xx, yy);
               ii += 4;
            }
            else
            {
               console.log ("ERROR: unknow form " + form + " calling trazoShape!");
               break; // error!
            }
         }
         if (closep)
            c2d.closePath();
      }
   }

   function drawImage2canvas (c2d, source, px, py)
   {
      //void ctx.drawImage(image, dx, dy);
      //void ctx.drawImage(image, dx, dy, dWidth, dHeight);
      //void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

      // the problem with this is that since drawImage will be delayed
      // the layer order will not be kept! so it is possible that the
      // image appears on top even if it is the first element on the list
      // (then should be back)

      var img = new Image();
      img.onload = function () { c2d.drawImage(img, +(px), +(py));  }
      img.src = source;
   }

   function applyCanvasStyle (c2d, styles, strstyle)
   {
      var estilos = parse2DStyle (styles [strstyle] || strstyle);

      if ("fill" in estilos)
      {
         c2d.fillStyle = estilos["fill"];
         c2d.fill ();
      }
      if ("stroke-width" in estilos)
      {
         c2d.lineWidth = estilos["stroke-width"];
      }
      c2d.strokeStyle = ("stroke" in estilos) ? estilos["stroke"]: "#000000";
      c2d.stroke ();
   }

   function drawGraffiti2canvas (trazos, canv, props)
   {
      var c2d = canv.getContext('2d');

      // sample trazos:
      //
      //    "defstyle", "red", "sc:#AA1010"
      //    "z", 10, 10, "red"       , "pol", 40, 0, 10, -50, -66, 30
      //    "z", 10, 10, "fc:#990122", "jau", 40, 0, 10, -50, -66, 30
      //    "z", 10, 10, "fc:#990122", "jau", 40, 0, 10, -50, -66, 30

      function makestyle (a) { return a; }

      var styles = {};

      var applyprop = (!props || props.autofit) ? boundingBoxAndAutoScale (trazos, canv.width, canv.height): props;
      var hasScaleAndOffsets = "scalex" in applyprop;

      // apply scales and offsets
      //
      if (hasScaleAndOffsets)
      {
         c2d.save ();

         c2d.lineWidth = 1.0 / applyprop.scalex; // compensate the scale with stroke
         c2d.scale (applyprop.scalex, applyprop.scaley);
         c2d.translate (applyprop.offsetx, applyprop.offsety);
      }

      for (var rr in trazos)
      {
         if (!trazos[rr] || trazos[rr].length < 3) continue;
         if (trazos[rr][0] === "defstyle") {
            styles [trazos[rr][1]] = makestyle (trazos[rr][2]);
         }
         else if (trazos[rr][0] === "img") {
            //    [ "img" ,238, 121, "scale=1.;opacity=1.",  "logas.png" ],
            drawImage2canvas (c2d, trazos[rr][4], trazos[rr][1], trazos[rr][2])
         }
         else if (trazos[rr][0] === "text" || trazos[rr][0] === "txt") {
            var estilos = parse2DStyle (styles [trazos[rr][3]] || trazos[rr][3]);
            if ("fill" in estilos)
            {
               c2d.fillStyle = estilos["fill"];
               c2d.fillText (trazos[rr][4], trazos[rr][1], trazos[rr][2]);
            }
            if ("stroke" in estilos)
            {
               c2d.strokeStyle = estilos["stroke"];
               c2d.strokeText (trazos[rr][4], trazos[rr][1], trazos[rr][2]);
            }
         }
         else if (trazos[rr][0] === "rect" || trazos[rr][0] === "rec") {
            c2d.rect (trazos[rr][1], trazos[rr][2], trazos[rr][4], trazos[rr][5]);
            applyCanvasStyle (c2d, styles, trazos[rr][3]);
         }
         else if (trazos[rr][0] === "circle" || trazos[rr][0] === "cir") {
            c2d.beginPath();
            c2d.ellipse (trazos[rr][1], trazos[rr][2], trazos[rr][4], trazos[rr][4], 0, 2 * Math.PI, 0);
            applyCanvasStyle (c2d, styles, trazos[rr][3]);
         }
         else if (trazos[rr][0] === "ellipse" || trazos[rr][0] === "ell") {
            // void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
            c2d.beginPath();
            c2d.ellipse (trazos[rr][1], trazos[rr][2], trazos[rr][4], trazos[rr][5], 0, 2 * Math.PI, 0);
            applyCanvasStyle (c2d, styles, trazos[rr][3]);
         }
         else if (trazos[rr][0] === "z" && trazos[rr].length >= 6) {
            // 0   1    2     3      4  5...
            // z ,238, 121, "pel", jau, 84,39,109,-20,47,23,-6,54,-22,20,-35,25,-68,29,-75,1,-54,-29,-31,-81
            // trazoShape2canvas (c2d, form, px, py, style, closep, arrp)
            trazoShape2canvas (c2d,
                        trazos[rr][4].substring (0, 3),              // type ("pol" "jau" etc)
                        trazos[rr][1],                               // x0
                        trazos[rr][2],                               // y0
                        styles [trazos[rr][3]]|| trazos[rr][3],      // path style
                        trazos[rr][4].length > 3 && trazos[rr][4].substring(3) === 'z', // is closed ?
                        trazos[rr].slice (5));
            applyCanvasStyle (c2d, styles, trazos[rr][3]);
         }
      }

      if (hasScaleAndOffsets)
         c2d.restore ();
   }

   ///////////////////////////////////
   // trazos - graffiti 2 svg
   ///////////////////////////////////

   function trazoText2svg (svgEle, px, py, pathStyle, textContent)
   {
      var pato = document.createElementNS (SVGNamespace, "text");

      pato.setAttribute ("x", +(px));
      pato.setAttribute ("y", +(py));
      pato.textContent = textContent;

      var estilos = parse2DStyle (pathStyle);
      for (var ee in estilos)
         pato.setAttribute (ee, estilos[ee]);
      if (!("stroke" in estilos))
         pato.setAttribute ("stroke", "#000000");

      svgEle.appendChild (pato);
   }

   function trazoImage2svg (svgEle, px, py, pathStyle, imageSource)
   {
      //<svg>
      //
      //   <image x="20" y="20" width="256" height="256" opacity="0.5" href="tiles/14/7813/5985.png" />
      //   <image x="236" y="20" width="256" height="256" href="tiles/13/3906/2992.png" />
      //
      //</svg>
      var pato = document.createElementNS (SVGNamespace, "image");
      pato.setAttribute ("x", +(px));
      pato.setAttribute ("y", +(py));
      pato.setAttribute ("href", imageSource);

      var estilos = parse2DStyle (pathStyle);
      for (var ee in estilos)
         pato.setAttribute (ee, estilos[ee]);

      svgEle.appendChild (pato);
   }

   function createSvgElement (svgtype, style)
   {
      var pato = document.createElementNS (SVGNamespace, svgtype);

      var estilos = parse2DStyle (style);
      for (var ee in estilos)
         pato.setAttribute (ee, estilos[ee]);
      if (!("stroke" in estilos))
         pato.setAttribute ("stroke", "#000000");

     return pato;
   }

   function trazoShape2svg (svgEle, forma, px, py, pathStyle, closep, arrp)
   {
      //<svg height="210" width="400">
      //   <path d="M150 0 L75 200 L225 200 Z" />
      //</svg>

     // <path d="M 100 350 q 150 -300 300 0" stroke="blue"  stroke-width="5" fill="none" />
      var pato = createSvgElement ("path", pathStyle);

      var dstr = [ "M " + px + " " + py + " " ];

      if (forma === "jau") {
         var curv = autoCasteljau (+(px), +(py), closep, arrp);
         curv.computePoints ();
         var cc = curv.getArrayCasteljau ();

         dstr.push (" C ");
         for (var ii = 2; ii+5 < cc.length; ii += 6)
            dstr.push (cc[ii] + " " + cc[ii+1] + " " + cc[ii+2] + " " + cc[ii+3] + " " + cc[ii+4] + " " + cc[ii+5] + " ");
      }
      else {
         if (forma === "pol")
            dstr.push (" l ");
         else if (forma == "qua")
            dstr.push (" q ");
         else if (forma == "cub" || forma == "bez")
            dstr.push (" c ");

         for (var ii = 0; ii < arrp.length; /**/)
         {
            if (forma === "pol") {
               dstr.push (arrp[ii] + " " + arrp[ii+1] + " ");
               ii += 2;
            }
            else if (forma == "qua") {
               dstr.push (arrp[ii] + " " + arrp[ii+1] + " " + arrp[ii+2] + " " + arrp[ii+3] + " ");
               ii += 4;
            }
            else if (forma == "cub" || forma == "bez") {
               dstr.push (arrp[ii] + " " + arrp[ii+1] + " " + arrp[ii+2] + " " + arrp[ii+3] + " " + arrp[ii+4] + " " + arrp[ii+5] + " ");
               ii += 6;
            }
            else
            {
               console.log ("ERROR: unknow form " + forma + " calling trazoShape!");
               break; // error!
            }
         }
         if (closep)
            dstr.push (" Z");
      }

      pato.setAttribute ("d", dstr.join (""));
      svgEle.appendChild (pato);
   }

   function drawGraffiti2svg (trazos, svgElem, props, restData)
   {
      function makestyle (a) { return a; }

      var styles = {};

      // ---------------------
      // add parent element "g" basically for auto-fit transformations
      //
      var gaga = document.createElementNS (SVGNamespace, "g");

      var applyprop = props || { autofit: true };
      if (applyprop.autofit)
      {
         // example transform:
         //      <g transform="translate(1, 1) scale(2, 2)  rotate(45)"><path>...</path></g>
         var wi = parseInt (svgElem.style.width || DEFAULT_GRAPH_DX);
         var hi = parseInt (svgElem.style.height || DEFAULT_GRAPH_DY);

         // special SVG issue with SVGLength ... change it if you know something about this stupid thing
         //
         if (svgElem.width && svgElem.width.baseVal) wi = parseInt (svgElem.width.baseVal.value);
         if (svgElem.height && svgElem.height.baseVal) hi = parseInt (svgElem.height.baseVal.value);

         applyprop = boundingBoxAndAutoScale (trazos, wi, hi);
      }
      var hasScaleAndOffsets = "scalex" in applyprop;

      // apply scales and offsets
      //
      if (hasScaleAndOffsets)
      {
         gaga.setAttribute ("stroke-width", "" + (1.0 / applyprop.scalex));
         gaga.setAttribute ("transform",
                            " scale     (" + applyprop.scalex + ", " + applyprop.scaley + ")" +
                            " translate (" + applyprop.offsetx + ", " + applyprop.offsety + ")");
      }
      svgElem.appendChild (gaga);

      // ---------------------
      // set all paths
      //
      for (var rr in trazos)
      {
         if (!trazos[rr] || trazos[rr].length < 3) continue;
         if (trazos[rr][0] === "defstyle") {
            styles [trazos[rr][1]] = makestyle (trazos[rr][2]);
         }
         else if (trazos[rr][0] === "gra" || trazos[rr][0] === "graf" || trazos[rr][0] === "graffiti") {

            var graffitiName = trazos[rr][3];
            var enPila = graffitiPila.indexOf (graffitiName) > -1;

            // "graf", 50, 50, Caballar, 100
            var graf = restData ? restData[graffitiName]: null;
            if (graf && !enPila)
            {
               var gelo = document.createElementNS (SVGNamespace, "svg");
               gelo.setAttribute("width",  trazos[rr][4] +  "px");
               gelo.setAttribute("height", trazos[rr][5]  +  "px");
               gelo.setAttribute("x", trazos[rr][1] +  "px");
               gelo.setAttribute("y", trazos[rr][2] +  "px");

               //gelo.setAttribute("preserveAspectRatio", "xMidYMid");
               //gelo.setAttribute("viewBox", "" + -trazos[rr][1] + " " + -trazos[rr][2] + " " + trazos[rr][4] + " " + trazos[rr][5] + " ");

               // enter recursive call
               graffitiPila.push (graffitiName);
               drawGraffiti2svg (graf, gelo, null, restData);
               graffitiPila.slice (-1, 1); // pop

               gaga.appendChild (gelo);
            }
         }
         else if (trazos[rr][0] === "img") {
            //    [ "img" ,238, 121, "scale=1.;opacity=1.",  "logas.png" ],
            trazoImage2svg (gaga,
                           trazos[rr][1],
                           trazos[rr][2],
                           styles [trazos[rr][3]]|| trazos[rr][3],
                           trazos[rr][4]);
         }
         else if (trazos[rr][0] === "text" || trazos[rr][0] === "txt") {
            //    [ "text" ,238, 121, "",  "pericollosso" ],
            trazoText2svg (gaga,
                           trazos[rr][1],
                           trazos[rr][2],
                           styles [trazos[rr][3]]|| trazos[rr][3],
                           trazos[rr][4]);
         }
         else if (trazos[rr][0] === "rect" || trazos[rr][0] === "rec") {
            //    [ "rect" ,238, 121, "",  dx, dy, rx, ry ],
            var pato = createSvgElement ("rect", styles [trazos[rr][3]]|| trazos[rr][3]);

            // <rect x="50" y="20" rx="20" ry="20" width="150" height="150"
            pato.setAttribute ("x", trazos[rr][1]);
            pato.setAttribute ("y", trazos[rr][2]);
            pato.setAttribute ("width",  trazos[rr][4]);
            pato.setAttribute ("height", trazos[rr][5]);
            pato.setAttribute ("rx", trazos[rr][6]||0);
            pato.setAttribute ("ry", trazos[rr][7]||0);
            gaga.appendChild (pato);
         }
         else if (trazos[rr][0] === "circle" || trazos[rr][0] === "cir") {
            //    [ "circle" ,238, 121, "",  dx, dy, rx, ry ],
            var pato = createSvgElement ("circle", styles [trazos[rr][3]]|| trazos[rr][3]);

            // <rect x="50" y="20" rx="20" ry="20" width="150" height="150"
            pato.setAttribute ("cx", trazos[rr][1]);
            pato.setAttribute ("cy", trazos[rr][2]);
            pato.setAttribute ("r", trazos[rr][4]);
            gaga.appendChild (pato);
         }
         else if (trazos[rr][0] === "ellipse" || trazos[rr][0] === "ell") {
            //    [ "circle" ,238, 121, "",  rx, ry ],
            var pato = createSvgElement ("ellipse", styles [trazos[rr][3]]|| trazos[rr][3]);

            // <rect x="50" y="20" rx="20" ry="20" width="150" height="150"
            pato.setAttribute ("cx", trazos[rr][1]);
            pato.setAttribute ("cy", trazos[rr][2]);
            pato.setAttribute ("rx", trazos[rr][4]);
            pato.setAttribute ("ry", trazos[rr][5]);
            gaga.appendChild (pato);
         }
         else if (trazos[rr][0] === "z" && trazos[rr].length >= 6) {
            // 0   1    2     3      4  5...
            // z ,238, 121, "pel", jau, 84,39,109,-20,47,23,-6,54,-22,20,-35,25,-68,29,-75,1,-54,-29,-31,-81
            // trazoShape2SVG (gaga, form, px, py, styleStr, closep, arrp)
            trazoShape2svg (gaga,
                        trazos[rr][4].substring (0, 3),
                        trazos[rr][1],
                        trazos[rr][2],
                        styles [trazos[rr][3]]|| trazos[rr][3],
                        trazos[rr][4].length > 3 && trazos[rr][4].substring(3) == 'z',
                        trazos[rr].slice (5));
         }
      }
   }

   // go through all elements (divs) of class "graffiti", gets its ids
   // and if the data <"id" graffiti> is found then
   // set an svg or a canvas if svg is not supported and draw the graffiti
   //
   function renderClassGraffiti (uData, scalesAndOffsets)
   {
      var supportSVG = !!window.SVGSVGElement;
      // supportSVG = false;

      // render all canvas graffitis
      //
      //NOT! var arr = document.getElementsByClassName ("graffiti");
      var arr = [].slice.call(document.getElementsByClassName('graffiti'), 0);
      for (var indx in arr) {
         var grafo = arr[indx].id + " graffiti";
         if (!uData [grafo]) continue;

         var styW = parseInt(arr[indx].style.width||DEFAULT_GRAPH_DX);
         var styH = parseInt(arr[indx].style.height||DEFAULT_GRAPH_DY);

         // create new html element svg or canvas
         // NOTE!!! create svg with special NS method!!
         //
         var gele = (supportSVG) ? document.createElementNS (SVGNamespace, "svg"):
                               document.createElement ("canvas");

         gele.setAttribute("width", styW +  "px");
         gele.setAttribute("height", styH +  "px");

         if (supportSVG)
            drawGraffiti2svg (uData [grafo], gele, scalesAndOffsets, uData);
         else
            drawGraffiti2canvas (uData [grafo], gele, scalesAndOffsets);

         // remove previous if any and add the new one
         while (arr[indx].hasChildNodes())
            arr[indx].removeChild(arr[indx].firstChild);

         arr[indx].appendChild (gele);
      }
   }

   function renderCanvasGraffitis (uData, scalesAndOffsets)
   {
      // render all canvas graffitis
      //
      var arr = [].slice.call(document.getElementsByTagName('canvas'), 0);
      for (var indx in arr) {
         var grafo = arr[indx].id + " graffiti";
         if (uData [grafo])
            drawGraffiti2canvas (uData [grafo], arr[indx], scalesAndOffsets);
      }
   }

   function renderSvgGraffitis (uData, scalesAndOffsets)
   {
      // render all svg graffitis
      //
      var arr = [].slice.call(document.getElementsByTagNameNS (SVGNamespace, "svg"));
      for (var indx in arr)
      {
         var grafo = arr[indx].id + " graffiti";
         if (uData [grafo])
            drawGraffiti2svg (uData [grafo], arr[indx], scalesAndOffsets, uData);
      }
   }
};
