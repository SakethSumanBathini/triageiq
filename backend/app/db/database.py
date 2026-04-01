import aiosqlite
import os

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./triageiq.db").replace("sqlite:///", "")


async def get_db():
    return await aiosqlite.connect(DB_PATH)


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS triage_results (
                id TEXT PRIMARY KEY,
                subject TEXT,
                sender TEXT,
                category TEXT,
                urgency INTEGER,
                sentiment TEXT,
                confidence REAL,
                assignee_name TEXT,
                assignee_role TEXT,
                provider_used TEXT,
                processing_time_ms REAL,
                requires_human_review INTEGER,
                is_spam INTEGER,
                timestamp TEXT
            )
        """)
        await db.commit()


async def save_result(result: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT OR REPLACE INTO triage_results
            (id, subject, sender, category, urgency, sentiment, confidence,
             assignee_name, assignee_role, provider_used, processing_time_ms,
             requires_human_review, is_spam, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result["id"], result["subject"], result["sender"],
            result["category"], result["urgency"], result["sentiment"],
            result["confidence"], result["assignee_name"],
            result["assignee_role"], result["provider_used"],
            result["processing_time_ms"], result["requires_human_review"],
            result["is_spam"], result["timestamp"]
        ))
        await db.commit()


async def get_analytics():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        total = await db.execute("SELECT COUNT(*) as count FROM triage_results WHERE is_spam = 0")
        total_row = await total.fetchone()
        total_count = total_row["count"] if total_row else 0

        categories = await db.execute(
            "SELECT category, COUNT(*) as count FROM triage_results WHERE is_spam = 0 GROUP BY category"
        )
        cat_rows = await categories.fetchall()
        category_breakdown = {row["category"]: row["count"] for row in cat_rows}

        urgencies = await db.execute(
            "SELECT urgency, COUNT(*) as count FROM triage_results WHERE is_spam = 0 GROUP BY urgency"
        )
        urg_rows = await urgencies.fetchall()
        urgency_breakdown = {str(row["urgency"]): row["count"] for row in urg_rows}

        avg_conf = await db.execute(
            "SELECT AVG(confidence) as avg FROM triage_results WHERE is_spam = 0"
        )
        avg_row = await avg_conf.fetchone()
        avg_confidence = round(float(avg_row["avg"] or 0), 3)

        human_review = await db.execute(
            "SELECT COUNT(*) as count FROM triage_results WHERE requires_human_review = 1"
        )
        hr_row = await human_review.fetchone()
        hr_count = hr_row["count"] if hr_row else 0
        human_review_rate = round(hr_count / max(total_count, 1), 3)

        providers = await db.execute(
            "SELECT provider_used, COUNT(*) as count FROM triage_results GROUP BY provider_used"
        )
        prov_rows = await providers.fetchall()
        provider_stats = {row["provider_used"]: row["count"] for row in prov_rows}

        return {
            "total_emails": total_count,
            "category_breakdown": category_breakdown,
            "urgency_breakdown": urgency_breakdown,
            "avg_confidence": avg_confidence,
            "human_review_rate": human_review_rate,
            "provider_stats": provider_stats
        }
