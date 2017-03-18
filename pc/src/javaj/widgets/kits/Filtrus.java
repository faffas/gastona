/*
package de.elxala.langutil
(c) Copyright 2005 Alejandro Xalabarder Aulet

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 59 Temple
Place - Suite 330, Boston, MA 02111-1307, USA.
*/

package javaj.widgets.kits;

/**   ======== de.elxala.langutil.Filtrus ==========================================
   @author Alejandro Xalabarder 23.03.2002 19:08

   Pequenya clase (temporal) que implementa un sencillo FilterFilter para el FileChooser.
*/

public class Filtrus extends javax.swing.filechooser.FileFilter {

   private String dasExtension = null;

   public Filtrus (String extension)
   {
      dasExtension = extension;
   }


   public boolean accept (java.io.File f)
   {
      if (dasExtension == null || dasExtension.length () == 0)
         return true;

      // descubrir la extension (falta me'todo)
      //
      String ss = f.getName ();
      int po = ss.length ()-1;
      int pp = po;

      // System.out.println ("ss = [" + ss + "]");

      while (pp >= 0) {
         if (ss.charAt (pp) == '.') break;
         pp --;
      }

      // System.out.println ("pp es = [" + pp + "]");
      if (pp >= 0) {
         // System.out.println ("substring (" + pp + ", " + (po-pp) + ")");
         ss = ss.substring (pp, ss.length ());
         // System.out.println ("novo ss es = [" + ss + "]");
         return ss.equalsIgnoreCase ("." + dasExtension);
      }
      return true;   // ?? directories ...
   }


    /**
     * The description of this filter. For example: "JPG and GIF Images"
     * @see FileView#getName
     */
   public String getDescription()
   {
      return dasExtension;
   }
}