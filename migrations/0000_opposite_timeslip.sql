CREATE TABLE "generated_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"prompt" text NOT NULL,
	"original_qr_url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"prediction_id" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"hashed_password" text DEFAULT '$2a$10$5m6escv2tz/zapH6fMUkDeKfSBwuvE7sMGHLv75gkINil5JQHOdhC' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;