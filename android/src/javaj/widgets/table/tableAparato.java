/*
package javaj.widgets
Copyright (C) 2005 Alejandro Xalabarder Aulet

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

package javaj.widgets.table;

import android.content.Context;

import javaj.widgets.table.util.*;
import de.elxala.mensaka.*;

/**
   Final table aparato with widget system (swing or android) specific methods
*/
public class tableAparato extends tableAparatoGeneral
{
   public tableAparato (MensakaTarget objCtrl, tableEBS pDataAndControl)
   {
      super (objCtrl, pDataAndControl);
   }

   // Swing tableModel obtained from our eva model
   // is what swing needs for its JTable
   //             vvv cambiar tipo de retorno!!! por androidTable
   public androidListModelAdapter getAndroidTableModel ()
   {
      // por ahora ...
      return getAndroidListModel ();
   }

   // Android tableModel obtained from our eva model
   // is what android needs for its ListView
   //
   public androidListModelAdapter getAndroidListModel ()
   {
      return /*(ListModel)*/ new androidListModelAdapter (getRealTableObject (), ebsTable ());
   }

   public androidSpinnerModelAdapter getAndroidSpinnerModel ()
   {
      return /*(ListModel)*/ new androidSpinnerModelAdapter (getRealTableObject (), ebsTable ());
   }
}

