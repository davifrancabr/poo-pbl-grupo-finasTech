CREATE TABLE "ExpenseSplit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expenseId" uuid NOT NULL,
	"memberId" uuid NOT NULL,
	"shareAmount" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"payerId" uuid NOT NULL,
	"totalAmount" bigint NOT NULL,
	"description" text NOT NULL,
	"occurredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "GoalContribution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goalId" uuid NOT NULL,
	"memberId" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"contributedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"currency_code" text DEFAULT 'BRL' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"groupId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ReserveTransaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"memberId" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"occurredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SavingsGoal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"groupId" uuid NOT NULL,
	"title" text NOT NULL,
	"targetAmount" bigint NOT NULL,
	"currentAmount" bigint DEFAULT 0 NOT NULL,
	"deadline" timestamp
);
--> statement-breakpoint
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_expenseId_Expense_id_fk" FOREIGN KEY ("expenseId") REFERENCES "public"."Expense"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_groupId_Groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_goalId_SavingsGoal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."SavingsGoal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Members" ADD CONSTRAINT "Members_groupId_Groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ReserveTransaction" ADD CONSTRAINT "ReserveTransaction_groupId_Groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_groupId_Groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."Groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ExpenseSplit_expenseId_idx" ON "ExpenseSplit" USING btree ("expenseId");--> statement-breakpoint
CREATE INDEX "Expense_groupId_idx" ON "Expense" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "GoalContribution_goalId_idx" ON "GoalContribution" USING btree ("goalId");--> statement-breakpoint
CREATE INDEX "Member_groupId_idx" ON "Members" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "ReserveTransaction_groupId_idx" ON "ReserveTransaction" USING btree ("groupId");--> statement-breakpoint
CREATE INDEX "SavingsGoal_groupId_idx" ON "SavingsGoal" USING btree ("groupId");