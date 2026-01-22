import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

async function applyMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL not set");
    process.exit(1);
  }
  
  console.log("Connecting to database via HTTP (pooler-compatible)...");
  const sql = neon(databaseUrl);
  
  const migrationPath = path.join(process.cwd(), "drizzle", "migrations", "0000_lazy_sister_grimm.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  
  console.log("Migration file loaded");
  console.log("Applying migration...");
  
  try {
    const statements = migrationSql
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log("Found " + statements.length + " statements to execute");
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log("  [" + (i + 1) + "/" + statements.length + "] Executing...");
      
      try {
        await sql.query(statement);
        console.log("  SUCCESS: Statement " + (i + 1) + " executed");
      } catch (error) {
        if (error.message && error.message.includes("already exists")) {
          console.log("  SKIPPED: Statement " + (i + 1) + " (already exists)");
        } else {
          console.error("  ERROR: Statement " + (i + 1) + " failed:", error.message);
          throw error;
        }
      }
    }
    
    console.log("SUCCESS: Migration applied!");
    console.log("");
    console.log("Verifying session table...");
    
    const result = await sql.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'session' ORDER BY ordinal_position");
    
    console.log("Session table columns:");
    result.rows.forEach((col) => {
      console.log("  - " + col.column_name + ": " + col.data_type);
    });
    
    console.log("");
    console.log("SUCCESS: All done! Restart your dev server.");
    
  } catch (error) {
    console.error("ERROR: Migration failed:", error.message);
    process.exit(1);
  }
}

applyMigrations();
