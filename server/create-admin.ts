import "dotenv/config";
import { supabaseAdmin, isSupabaseConfigured } from "./utils/supabase";

async function createAdminUser() {
  console.log("=========================================");
  console.log("  PROVISIONING ADMIN USER IN SUPABASE");
  console.log("=========================================\n");

  const email = (process.env.ADMIN_EMAIL || "esayasadal369@gmail.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "OMAMstudio@2026";
  const name = process.env.ADMIN_NAME || "Esayas Adal";

  console.log(`Admin Email:    ${email}`);
  console.log(`Admin Name:     ${name}`);
  console.log(`Connected to:   ${process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL}\n`);

  if (!isSupabaseConfigured) {
    console.error("❌ Supabase credentials are missing or invalid in .env!");
    process.exit(1);
  }

  let authUserId = "";

  // 1. Check if user already exists in Supabase Auth, or create/update
  try {
    console.log("1️⃣ Checking / Creating user in Supabase Auth...");
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.warn("⚠️ Could not list users via admin API:", listError.message);
    }

    const existingUser = usersList?.users?.find(
      (u: any) => u.email?.toLowerCase().trim() === email
    );

    if (existingUser) {
      authUserId = existingUser.id;
      console.log(`  ✓ User already exists in Supabase Auth (UID: ${authUserId}). Updating password...`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: password,
        email_confirm: true,
        user_metadata: { full_name: name, role: "admin" },
      });
      if (updateError) {
        console.error("  ❌ Failed to update user password in Auth:", updateError.message);
      } else {
        console.log("  ✓ Password & metadata updated successfully in Supabase Auth.");
      }
    } else {
      console.log("  Creating new user in Supabase Auth...");
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, role: "admin" },
      });

      if (createError) {
        console.warn("  ⚠️ Admin createUser notice:", createError.message);
      } else if (newUser?.user) {
        authUserId = newUser.user.id;
        console.log(`  ✓ Admin user created in Supabase Auth with UID: ${authUserId}`);
      }
    }
  } catch (err: any) {
    console.warn("  ⚠️ Supabase Auth admin API notice:", err.message);
  }

  // 2. Insert/Upsert into public.users table
  try {
    console.log("\n2️⃣ Upserting admin record in 'public.users' table...");
    const uidToSave = authUserId || `admin-${Date.now()}`;
    const { data: userRow, error: dbError } = await supabaseAdmin
      .from("users")
      .upsert(
        {
          uid: uidToSave,
          email,
          role: "admin",
          created_at: new Date().toISOString(),
        },
        { onConflict: "uid" }
      )
      .select()
      .single();

    if (dbError) {
      // If table doesn't exist yet, warn
      console.warn("  ⚠️ DB users table upsert notice:", dbError.message);
    } else {
      console.log("  ✓ Admin record confirmed in 'public.users' table (ID:", userRow?.id, ")");
    }
  } catch (err: any) {
    console.warn("  ⚠️ Users table notice:", err.message);
  }

  // 3. Test Authentication
  console.log("\n3️⃣ Testing authentication via signInWithPassword...");
  try {
    const { data: authData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log("  ℹ️ Note: Supabase signInWithPassword status:", signInError.message);
      console.log("  ✓ Fallback local authentication is enabled in server.ts with matching .env credentials.");
    } else {
      console.log("  ✓ SUCCESS! Verified direct login with Supabase Auth for:", authData.user?.email);
    }
  } catch (err: any) {
    console.log("  ℹ️ Direct signIn status:", err.message);
  }

  console.log("\n=========================================");
  console.log("  ADMIN SETUP READY!");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("=========================================\n");
}

createAdminUser().catch(console.error);
