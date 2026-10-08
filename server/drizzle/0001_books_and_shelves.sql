CREATE TYPE "public"."book_format" AS ENUM('pdf', 'epub', 'txt');--> statement-breakpoint
CREATE TYPE "public"."book_status" AS ENUM('private', 'pending', 'published', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."shelf" AS ENUM('watchlist', 'reading', 'read');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"description" text,
	"format" "book_format" NOT NULL,
	"file_key" text NOT NULL,
	"file_size" integer NOT NULL,
	"status" "book_status" DEFAULT 'private' NOT NULL,
	"uploaded_by" uuid,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_file_key_unique" UNIQUE("file_key")
);
--> statement-breakpoint
CREATE TABLE "user_books" (
	"user_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"shelf" "shelf" DEFAULT 'watchlist' NOT NULL,
	"location" jsonb,
	"fraction" real DEFAULT 0 NOT NULL,
	"furthest_pages" real,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_books_user_id_book_id_pk" PRIMARY KEY("user_id","book_id")
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "books_status_created_at_idx" ON "books" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "books_uploaded_by_idx" ON "books" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "user_books_book_id_shelf_idx" ON "user_books" USING btree ("book_id","shelf");