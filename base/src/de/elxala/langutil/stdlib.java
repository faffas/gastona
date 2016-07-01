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

package de.elxala.langutil;

public class stdlib
{
   public static int unsigned (byte val)
   {
      return (val >= 0) ? val: 256 + val;
   }

   public static int atoi (String sInt)
   {
      return (int) (atof (sInt));
   }

   public static long atol (String sLong)
   {
      return (long) (atof (sLong));
   }

   public static double atof (String sDob)
   {
      double reto = 0.;

      try {
         reto = Double.parseDouble(sDob);
      }
      catch (Exception e) {}

      return reto;
   }

   public static String numberFix (float number, int decim)
   {
      return numberFix (number, decim, false);
   }

   public static String numberFix (float number, int decim, boolean removeZeroes)
   {
      String sal = de.elxala.math.utilMath.round (number, decim) + "000000000000000".substring (0, decim);
      int indx = sal.indexOf (".");
      sal = sal.substring (0, indx >= 0 ? 1 + indx + decim: sal.length());

      // remove right zeroes if wanted
      if (removeZeroes)
         while (sal.charAt (sal.length () -1) == '0')
            sal = sal.substring (0, sal.length () -1);

      sal = sal.replaceAll (",", "."); // avoid localization ... etc

      // remove point if ends with "xxxx."
      if (sal.charAt (sal.length () -1) == '.')
         sal = sal.substring (0, sal.length () -1);
      return sal;
   }

   public static String removeDotZero (String number)
   {
      if (number.endsWith (".0"))
         return number.substring (0, number.length () -2);
      return number;
   }

   public static int hexchar2int (char car)
   {
      return (car >= '0' && car <= '9') ? car - '0' :
             (car >= 'A' && car <= 'F') ? 10 + car- 'A' :
             (car >= 'a' && car <= 'f') ? 10 + car - 'a' : -1;
   }

   public static char[] hexStr2charArr (String str)
   {
      int len = str.length();
      if (len % 2 == 1) len --; // don't compute last one!
      if (len < 2) return new char [0];

      char[] data = new char[len / 2];
      for (int ii = 0, indx = 0; ii < len; ii += 2, indx ++)
      {
         data[indx] = (char) (hexchar2int (str.charAt (ii)) * 16 + hexchar2int (str.charAt (ii+1)));
      }
      return data;
   }
}