/*
java package de.elxala.Eva (see EvaFormat.PDF)
Copyright (C) 2005  Alejandro Xalabarder Aulet

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 3 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

package de.elxala.langutil;

import java.util.*;

/**
   class strUtil
   @author Alejandro Xalabarder Aulet
   @date   2017

   Rests of old Cadena.java
*/
public class strUtil
{


   public static String linkStrings (String s1, String s2, String link)
   {
      if (s1.length () == 0) return s2;
      if (s2.length () == 0) return s1;
      return s1 + link + s2;
   }
   
   // converts a string to a string escaped for a regular expression
   //    stringToRegexStr ("[(.)]") length = 5
   //    gives back "\[\(\.\)\]" length = 10
   public static String stringToRegexStr (String raw)
   {
      return raw; // just to make gastona_j14.jar compile
      //return raw.replace ("\\", "\\\\").replace ("(", "\\(").replace (")", "\\)")
      //          .replace ("[", "\\[").replace ("]", "\\]").replace (".", "\\.")
      //          .replace ("\"", "\\\"").replace ("/", "\\/").replace("|", "\\|")
      //          .replace("+", "\\+").replace("?", "\\?");
   }
   
   public static String regexStrToString (String regexStr)
   {
      return regexStr; // just to make gastona_j14.jar compile
      //return regexStr.replace ("\\?", "?").replace ("\\+", "+")
      //               .replace ("\\\"", "\"").replace ("\\/", "/").replace("\\|", "|")
      //               .replace ("\\[", "[").replace ("\\]", "]").replace ("\\.", ".")
      //               .replace ("\\)", ")").replace ("\\(", "(").replace ("\\\\", "\\");
   }   
}
