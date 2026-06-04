export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          property_type: Database["public"]["Enums"]["property_type"];
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string;
          year_built: number | null;
          square_feet: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          property_type?: Database["public"]["Enums"]["property_type"];
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          year_built?: number | null;
          square_feet?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          property_type?: Database["public"]["Enums"]["property_type"];
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          year_built?: number | null;
          square_feet?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      rooms: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          room_type: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          room_type?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          room_type?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          }
        ];
      };
      asset_systems: {
        Row: {
          id: string;
          property_id: string;
          room_id: string | null;
          name: string;
          category: Database["public"]["Enums"]["asset_system_category"];
          brand: string | null;
          model: string | null;
          serial_number: string | null;
          install_year: number | null;
          install_date: string | null;
          estimated_age_range: Database["public"]["Enums"]["estimated_age_range"] | null;
          last_service_date: string | null;
          next_service_due_date: string | null;
          maintenance_interval_value: number | null;
          maintenance_interval_unit: Database["public"]["Enums"]["maintenance_interval_unit"] | null;
          expected_lifespan_years: number | null;
          condition: Database["public"]["Enums"]["asset_condition"];
          status: Database["public"]["Enums"]["asset_status"];
          estimated_replacement_cost: number | null;
          ownership_responsibility: Database["public"]["Enums"]["ownership_responsibility"];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          room_id?: string | null;
          name: string;
          category?: Database["public"]["Enums"]["asset_system_category"];
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          install_year?: number | null;
          install_date?: string | null;
          estimated_age_range?: Database["public"]["Enums"]["estimated_age_range"] | null;
          last_service_date?: string | null;
          next_service_due_date?: string | null;
          maintenance_interval_value?: number | null;
          maintenance_interval_unit?: Database["public"]["Enums"]["maintenance_interval_unit"] | null;
          expected_lifespan_years?: number | null;
          condition?: Database["public"]["Enums"]["asset_condition"];
          status?: Database["public"]["Enums"]["asset_status"];
          estimated_replacement_cost?: number | null;
          ownership_responsibility?: Database["public"]["Enums"]["ownership_responsibility"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          room_id?: string | null;
          name?: string;
          category?: Database["public"]["Enums"]["asset_system_category"];
          brand?: string | null;
          model?: string | null;
          serial_number?: string | null;
          install_year?: number | null;
          install_date?: string | null;
          estimated_age_range?: Database["public"]["Enums"]["estimated_age_range"] | null;
          last_service_date?: string | null;
          next_service_due_date?: string | null;
          maintenance_interval_value?: number | null;
          maintenance_interval_unit?: Database["public"]["Enums"]["maintenance_interval_unit"] | null;
          expected_lifespan_years?: number | null;
          condition?: Database["public"]["Enums"]["asset_condition"];
          status?: Database["public"]["Enums"]["asset_status"];
          estimated_replacement_cost?: number | null;
          ownership_responsibility?: Database["public"]["Enums"]["ownership_responsibility"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asset_systems_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asset_systems_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      property_type:
        | "single_family_house"
        | "condo"
        | "coop"
        | "apartment"
        | "multi_family"
        | "rental"
        | "vacation_home"
        | "other";
      asset_system_category:
        | "roof"
        | "hvac"
        | "furnace"
        | "boiler"
        | "water_heater"
        | "appliance"
        | "electrical"
        | "plumbing"
        | "gutters"
        | "windows"
        | "chimney"
        | "foundation"
        | "deck"
        | "driveway"
        | "pool"
        | "sump_pump"
        | "septic_or_sewer"
        | "irrigation"
        | "garage"
        | "security"
        | "other";
      estimated_age_range:
        | "zero_to_three_years"
        | "four_to_seven_years"
        | "eight_to_twelve_years"
        | "thirteen_to_twenty_years"
        | "over_twenty_years"
        | "unknown";
      asset_condition: "excellent" | "good" | "fair" | "poor" | "unknown";
      asset_status: "good" | "due_soon" | "needs_attention" | "missing_info";
      maintenance_interval_unit: "days" | "weeks" | "months" | "years";
      ownership_responsibility: "owner" | "hoa" | "landlord" | "tenant" | "shared" | "unknown";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyType = Database["public"]["Enums"]["property_type"];
export type AssetSystemRow = Database["public"]["Tables"]["asset_systems"]["Row"];
export type AssetSystemInsert = Database["public"]["Tables"]["asset_systems"]["Insert"];
export type AssetSystemCategory = Database["public"]["Enums"]["asset_system_category"];
