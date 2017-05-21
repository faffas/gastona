/*
library listix (www.listix.org)
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

/*
   //(o) WelcomeGastona_source_listix_command PARSONS

   ========================================================================================
   ================ documentation for javajCatalog.gast ===================================
   ========================================================================================

   This embedded EvaUnit describe the documentation for this listix command. Basically contains
   the syntaxes, options and examples for the listix commnad.

#gastonaDoc#

   <docType>    listix_command
   <name>       PARSER EVA
   <groupInfo>  data_parsers
   <javaClass>  listix.cmds.cmdParserEva
   <importance> 4
   <desc>       //Parses an EVA file and stores the data into a database

   <help>
      //
      // Parses an EVA file and stores the file name and the eva structure into a database.
      //

   <aliases>
      alias

   <syntaxHeader>
      synIndx, importance, desc
         1   ,    4      , //Parse 'evaSourceFile' and set the result into the database 'dbName' creating the schema if needed
         2   ,    4      , //Store into the file 'evaTargeFile' the Eva from the database 'sourceDbName' which file name is 'fileNameInDB'

   <syntaxParams>
      synIndx, name         , defVal      , desc
         1   , FILE2DB      ,             , //
         1   , evaSourceFile,             , //Name of text file to be parsed
         1   , targetDbName , (default db), //Database name where to put the result of parsing
         1   , tablePrefix  , eva         , //Optional prefix for the result tables ('prefix'_files, 'prefix'_evaData)
         1   , fileNameInDB , [evaSourceFile], //Optional fileName of the eva in the database

         2   , DB2FILE      ,             , //
         2   , fileNameInDB ,             , //Name of Eva file IN THE DATABASE (not the target Eva file!)
         2   , sourceDbName , (default db), //Database name where to get the eva data from
         2   , tablePrefix  , eva         , //Prefix for the table 'prefix'_evaData
         2   , evaTargeFile ,             , //Name of target Eva file


   <options>
      synIndx, optionName, parameters, defVal, desc

   <examples>
      gastSample


#**FIN EVA#
*/

package listix.cmds;

import java.util.*;

import listix.*;
import de.elxala.Eva.*;
import de.elxala.langutil.*;
import de.elxala.langutil.filedir.*;
import de.elxala.db.sqlite.*;
import de.elxala.db.dbMore.*;
import de.elxala.db.utilEscapeStr;

import de.elxala.zServices.*;
import de.elxala.mensaka.*;   // for messages start, progress, end


/**
*/
public class cmdParserEVA implements commandable
{
   //private static MessageHandle TX_FATALERROR    = new MessageHandle (); // "_lib scanFiles_error"
   private static MessageHandle LIGHT_MSG_START     = null; // new MessageHandle (); // "_lib parsons_start"
   private static MessageHandle LIGHT_MSG_PROGRESS  = null; // new MessageHandle (); // "_lib parsons_progresss"
   private static MessageHandle LIGHT_MSG_END       = null; // new MessageHandle (); // "_lib parsons_end"

   //Note : this variable is just a way to ensure that the static method is called once
   private static boolean sendMessages = initOnce_msgHandles ();

   private int fileID = -1;

   private static boolean initOnce_msgHandles ()
   {
      if (LIGHT_MSG_START == null)
      {
         LIGHT_MSG_START     = new MessageHandle ();
         LIGHT_MSG_PROGRESS  = new MessageHandle ();
         LIGHT_MSG_END       = new MessageHandle ();

         //(o) TODO_parsons Unify ledMsg parsing_start etc for PARSONS and XMELON

         //NOTE! the message should be the same as in parsons, this signal should be generl
         //      for parsing activity

         // this messages are not mandatory to be subscribed, the are provided just as internal information of parser command
         Mensaka.declare (null, LIGHT_MSG_START    , "ledMsg parsing_start"      , logServer.LOG_DEBUG_0);
         Mensaka.declare (null, LIGHT_MSG_PROGRESS , "ledMsg parsing_progresss"  , logServer.LOG_DEBUG_0);
         Mensaka.declare (null, LIGHT_MSG_END      , "ledMsg parsing_end"        , logServer.LOG_DEBUG_0);
      }
      return true;
   }

   /**
      get all the different names that the command can have
   */
   public String [] getNames ()
   {
      return new String []
      {
          "PARSER EVA",
          "PARSE EVA",
          "EVA PARSER",
          "EVA PARSE",
       };
   }

   /**
      Execute the commnad and returns how many rows of commandEva
      the command had.

         that           : the environment where the command is called
         commandEva     : the whole command Eva
         indxCommandEva : index of commandEva where the commnad starts
   */
   public int execute (listix that, Eva commands, int indxComm)
   {
      listixCmdStruct cmd = new listixCmdStruct (that, commands, indxComm);

      String oper = cmd.getArg(0);

      boolean todb   = cmd.meantConstantString (oper, new String [] { "FILE2DB" } );
      boolean tojson = cmd.meantConstantString (oper, new String [] { "FILE2JSON" } );
      boolean dbtofile = cmd.meantConstantString (oper, new String [] { "DB2FILE" } );

      if (todb)
          fileEva2DBorJSON (cmd, true);
      else if (tojson)
          fileEva2DBorJSON (cmd, false);
      else if (dbtofile)
         extractEvaFromDB (cmd);
      else
      {
         cmd.getLog().err ("PARSER EVA", "invalid option [" + oper + "]");
      }

      cmd.checkRemainingOptions ();
      return 1;
   }

   private String commaif(int counter)
   {
      return (counter > 0) ? ",": "";
   }

   // NOTE:   text  [hello "how" aren't you ?]
   //
   //       text.replaceAll("('|\")", "\\\\$1")
   //
   //         result [hello \"how\" aren\'t you ?]

   public void fileEva2DBorJSON (listixCmdStruct cmd, boolean toDB)
   {
      String oper        = cmd.getArg(0);
      String fileSource  = cmd.getArg(1);
      String dbName      = cmd.getArg(2);
      String tablePrefix = cmd.getArg(3);
      String fileNameInDB  = cmd.getArg(4);

      boolean toJSON = ! toDB;

      if (toDB)
      {
         if (tablePrefix.length () == 0)  tablePrefix = "eva";
         if (fileNameInDB.length () == 0) fileNameInDB = fileSource;
         if (dbName.length () == 0)       dbName = cmd.getListix ().getDefaultDBName ();
      }

      if (fileSource.length () == 0)
      {
         cmd.getLog().err ("PARSER EVA", "No file to scan given!");
         return;
      }

      if (cmd.getLog().isDebugging (2))
         cmd.getLog().dbg (2, "PARSER EVA", "execute with : oper [" + oper + "] fileSource [" + fileSource + "] dbName [" +  dbName + "] prefix [" + tablePrefix + "]");

      EvaFile efi = new EvaFile (fileSource);
      cmd.getLog().dbg (2, "PARSER EVA", "found " + efi.allUnits.size () + " units");

      if (efi.allUnits.size () == 0)
      {
         cmd.checkRemainingOptions ();
         return;
      }

      StringBuffer jsoStrBuf = new StringBuffer ();
      String taFiles = tablePrefix + "_files";
      String taData  = tablePrefix + "_evaData";
      sqlSolver myDB = null;

      if (toDB)
      {
         // Start scripts
         //

         //(o) listix_sql_schemas PARSONS FILE2DB schema creation

         // open DB
         myDB = new sqlSolver ();

         // ensure tables
         myDB.openScript ();
         myDB.writeScript ("CREATE TABLE IF NOT EXISTS " + taFiles + " (fileID int, timeParse text, fullPath text, UNIQUE(fileID));");
         myDB.writeScript ("CREATE TABLE IF NOT EXISTS " + taData  + " (fileID int, unitName text, evaName text, row int, col int, value text);");
         myDB.writeScript ("CREATE INDEX IF NOT EXISTS " + taData  + "_indx ON " + taData + " (fileID, unitName, evaName);");

         // o-o  Add dbMore connections info
         myDB.writeScript (deepSqlUtil.getSQL_CreateTableConnections ());
         myDB.writeScript (deepSqlUtil.getSQL_InsertConnection("file", taData, "fileID", taFiles, "fileID"));

         myDB.closeScript ();
         myDB.runSQL (dbName);

         long fileID = sqlUtil.getNextID(dbName, taFiles, "fileID", 1000);
         myDB.openScript ();
         myDB.writeScript ("INSERT INTO " + taFiles + " VALUES (" +
                       fileID + ", '" +
                       myDB.escapeString (DateFormat.getTodayStr ()) + "', '" +
                       myDB.escapeString (fileNameInDB) + "');");
      }

      if (toJSON) jsoStrBuf.append ("{ ");
      for (int ii = 0; ii < efi.allUnits.size (); ii ++)
      {
         EvaUnit eu = (EvaUnit) efi.allUnits.get (ii);
         if (toJSON) jsoStrBuf.append (commaif(ii) + " \"" + eu.getName () + "\" : { ");

         for (int vv = 0; vv < eu.size() ; vv ++)
         {
            Eva eva = eu.getEva (vv);
            if (toJSON) jsoStrBuf.append (commaif(vv) + " \"" + eva.getName () + "\" : [ ");

            if (eva == null)
            {
               if (toJSON) jsoStrBuf.append (" [] ]");
               continue;
            }

            //fileID, unitName, evaName, row, col, value

            for (int rr = 0; rr < eva.rows(); rr ++)
            {
               if (sendMessages) Mensaka.sendPacket ((rr % 2) == 0 ? LIGHT_MSG_END:LIGHT_MSG_START, null); // ... )))

               if (toJSON) jsoStrBuf.append (commaif(rr) + " [");
               for (int cc = 0; cc < eva.cols(rr) ; cc ++)
               {
                  if (toDB)
                  {
                     myDB.writeScript ("INSERT INTO " + taData + " VALUES ("
                     + fileID + ", "
                     + "'" + myDB.escapeString(eu.getName ()) + "', "
                     + "'" + myDB.escapeString(eva.getName ()) + "', "
                     + rr + ", "
                     + cc + ", "
                     + "'" + myDB.escapeString(eva.getValue (rr, cc)) + "'"
                     + ");");
                  }
                  else if (toJSON) jsoStrBuf.append (commaif(cc)  + "\"" + eva.getValue (rr, cc).replaceAll("('|\")", "\\\\$1") + "\"");
               }
               if (toJSON) jsoStrBuf.append (" ]");
            }
            if (toJSON) jsoStrBuf.append (" ]");
         }
         if (toJSON) jsoStrBuf.append (" }");
      }
      if (toJSON) jsoStrBuf.append (" }");

      if (toDB)
      {
         myDB.closeScript ();
         myDB.runSQL (dbName);
      }

      if (toJSON)
      {
         // if (OptSolveVar)
         //     that.printTextLsx (arrFormat[ii]);
         //else that.writeStringOnTarget (arrFormat[ii]);
         cmd.getListix ().writeStringOnTarget (jsoStrBuf.toString ());
      }
      if (sendMessages) Mensaka.sendPacket (LIGHT_MSG_END, null); // ... )))

      return;
   }

   public void extractEvaFromDB (listixCmdStruct cmd)
   {
      String oper        = cmd.getArg(0);
      String fileNameInDB  = cmd.getArg(1);
      String dbName      = cmd.getArg(2);
      String tablePrefix = cmd.getArg(3);
      String fileTarget  = cmd.getArg(4);
      if (tablePrefix.length () == 0)
         tablePrefix = "eva";

      if (fileNameInDB.length () == 0)
      {
         cmd.getLog().err ("PARSER EVA", "fileNameInDB not specified!");
         return;
      }

      if (dbName.length () == 0)
         dbName = cmd.getListix ().getDefaultDBName ();

      if (cmd.getLog().isDebugging (2))
         cmd.getLog().dbg (2, "PARSER EVA", "execute with : oper [" + oper + "] fileNameInDB [" +  fileNameInDB + "] dbName [" +  dbName + "]  prefix [" + tablePrefix + "] fileTarget [" + fileTarget + "]");

      if (fileTarget.length () == 0)
      {
         cmd.getLog().err ("PARSER EVA", "No target file given!");
         return;
      }

      // Start scripts
      //
      String taFiles = tablePrefix + "_files";
      String taData  = tablePrefix + "_evaData";

      //(o) listix_sql_schemas PARSONS FILE2DB schema creation

      // open DB
      sqlSolver myDB = new sqlSolver ();

      long fileID = sqlUtil.getID (dbName, "SELECT fileID FROM " + taFiles + " WHERE fullPath = '" + fileNameInDB + "'");
      if (fileID == -1)
      {
         cmd.getLog().err ("PARSER EVA", "Eva file name in DB [" + fileNameInDB + "] not found!");
         return;
      }

      tableROSelect taRO = new tableROSelect (dbName, "SELECT unitName, evaName, row, col, value FROM " + taData + " WHERE fileID = " + fileID + " ORDER BY unitName, evaName, row, col");

      EvaUnit eu = new EvaUnit (taRO.getValue ("unitName", 0)); // get first unit
      TextFile fi = new TextFile ();

      if (! fi.fopen (fileTarget, "w"))
      {
         cmd.getLog().err ("PARSER EVA", "cannot open file [" + fileTarget + "] for output!");
         return;
      }

      int rr = 0;
      for (int ii = 0; ii < taRO.getRecordCount (); ii ++)
      {
         if (eu.getName () != taRO.getValue ("unitName", ii))
         {
            fi.writeString (eu.toString ());
            eu = new EvaUnit (taRO.getValue ("unitName", ii));
         }

         Eva eva = eu.getSomeHowEva (taRO.getValue ("evaName", ii));

         int row = stdlib.atoi (taRO.getValue ("row", ii));
         int col = stdlib.atoi (taRO.getValue ("col", ii));
         String value = taRO.getValue ("value", ii);

         if (row == 0 && sendMessages)
            Mensaka.sendPacket ((rr++ % 2) == 0 ? LIGHT_MSG_END:LIGHT_MSG_START, null); // ... )))

         eva.setValue (value, row, col);
      }
      fi.writeString (eu.toString ());
      fi.fclose ();

      if (sendMessages) Mensaka.sendPacket (LIGHT_MSG_END, null); // ... )))

      return;
   }
}
