/*
packages for gastona
Copyright (C) 2015 Alejandro Xalabarder Aulet

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

package javaj;

import android.os.Handler;
import android.os.Bundle;
import android.os.Message;

public class utilHandler
{
   public static void sendToWidget (Handler han, int op, String value)
   {
      Message msgObj = han.obtainMessage ();
      Bundle bu = new Bundle ();
      bu.putInt    ("operation", op);
      bu.putString ("value", value);
      msgObj.setData (bu);
      han.sendMessage (msgObj);
   }
} 
