import datetime
import os
import sys
import django

# Setup django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coachconnect.settings")
django.setup()

from django.utils import timezone
from users.models import User, CoachProfile, StudentProfile
from courses.models import Course, LearningResource, Enrollment, ResourceProgress
from bookings.models import AvailabilitySlot, Booking
from notifications.models import Notification


def seed():
    print("[SEED] Starting CoachConnect database seeding...")

    # 1. Admin
    admin_user, _ = User.objects.get_or_create(
        email="admin@coachconnect.io",
        defaults={
            "username": "admin@coachconnect.io",
            "first_name": "Eleanor",
            "last_name": "Vance",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True,
            "bio": "Lead Platform Administrator overseeing quality and mentorship standards.",
            "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        },
    )
    admin_user.set_password("AdminPass123!")
    admin_user.save()

    # 2. Coaches
    coach_data = [
        {
            "email": "sarah.coach@coachconnect.io",
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "headline": "Principal Architect & Cloud Systems Mentor",
            "expertise": "Cloud Architecture, Kubernetes, Distributed Systems, Python",
            "qualifications": "AWS Certified Solutions Architect Pro, 12+ years at Tier-1 tech firms.",
            "hourly_rate": 85.00,
            "years_of_experience": 12,
            "rating": 4.95,
            "total_reviews": 48,
            "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            "bio": "Passionate about empowering engineers to design resilient distributed backends and navigate high-scale architecture.",
        },
        {
            "email": "david.coach@coachconnect.io",
            "first_name": "David",
            "last_name": "Chen",
            "headline": "Senior AI Researcher & Deep Learning Specialist",
            "expertise": "Machine Learning, PyTorch, LLMs, Computer Vision",
            "qualifications": "Ph.D. in Computer Science, author of 6 peer-reviewed papers.",
            "hourly_rate": 95.00,
            "years_of_experience": 9,
            "rating": 4.92,
            "total_reviews": 36,
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "bio": "Bridging state-of-the-art machine learning theory with production deployment.",
        },
        {
            "email": "elena.coach@coachconnect.io",
            "first_name": "Elena",
            "last_name": "Rostova",
            "headline": "Staff Full-Stack Engineer & Tech Lead",
            "expertise": "React.js, Django, TypeScript, API Design",
            "qualifications": "10+ years scaling web products from zero to millions of daily active users.",
            "hourly_rate": 75.00,
            "years_of_experience": 10,
            "rating": 4.88,
            "total_reviews": 52,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "bio": "Helping engineers master modern full-stack web applications with clean, maintainable architecture.",
        },
    ]

    coaches = []
    for c in coach_data:
        u, _ = User.objects.get_or_create(
            email=c["email"],
            defaults={
                "username": c["email"],
                "first_name": c["first_name"],
                "last_name": c["last_name"],
                "role": "coach",
                "phone": "+1 (555) 234-5678",
                "bio": c["bio"],
                "avatar": c["avatar"],
            },
        )
        u.set_password("CoachPass123!")
        u.save()

        cp, _ = CoachProfile.objects.get_or_create(
            user=u,
            defaults={
                "headline": c["headline"],
                "expertise": c["expertise"],
                "qualifications": c["qualifications"],
                "hourly_rate": c["hourly_rate"],
                "years_of_experience": c["years_of_experience"],
                "rating": c["rating"],
                "total_reviews": c["total_reviews"],
                "is_verified": True,
            },
        )
        coaches.append(u)

    # 3. Students
    student_data = [
        {
            "email": "alex.student@coachconnect.io",
            "first_name": "Alex",
            "last_name": "Rivera",
            "education_level": "Mid-Level Software Developer",
            "learning_goals": "Transition into Senior Backend Engineer & Cloud Architect roles.",
            "interests": "Microservices, Django REST, System Design, DevOps",
            "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        },
        {
            "email": "priya.student@coachconnect.io",
            "first_name": "Priya",
            "last_name": "Sharma",
            "education_level": "Computer Science Graduate",
            "learning_goals": "Master AI pipelines, model deployment, and full-stack integration.",
            "interests": "Deep Learning, Python, React, Cloud Computing",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        },
    ]

    students = []
    for s in student_data:
        u, _ = User.objects.get_or_create(
            email=s["email"],
            defaults={
                "username": s["email"],
                "first_name": s["first_name"],
                "last_name": s["last_name"],
                "role": "student",
                "phone": "+1 (555) 987-6543",
                "bio": f"Eager learner targeting advanced technical proficiencies. {s['learning_goals']}",
                "avatar": s["avatar"],
            },
        )
        u.set_password("StudentPass123!")
        u.save()

        StudentProfile.objects.get_or_create(
            user=u,
            defaults={
                "education_level": s["education_level"],
                "learning_goals": s["learning_goals"],
                "interests": s["interests"],
            },
        )
        students.append(u)

    # 4. Courses
    courses_seed = [
        {
            "coach": coaches[0],  # Sarah
            "title": "Mastering Distributed Systems & Cloud Architecture",
            "category": "Cloud & DevOps",
            "level": "Advanced",
            "duration_hours": 24,
            "price": 149.00,
            "description": "Comprehensive dive into building fault-tolerant, horizontally scalable systems using modern distributed patterns, asynchronous queues, and microservices on cloud infrastructure.",
            "learning_objectives": "Design event-driven microservices architectures\nImplement CAP theorem trade-offs and consistency models\nMaster container orchestration with Kubernetes\nConfigure multi-region load balancing and latency mitigation",
            "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
            "resources": [
                {"title": "Foundations of Distributed Consensus", "type": "video", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 25, "order": 1},
                {"title": "CAP Theorem & Eventual Consistency Deep Dive", "type": "document", "url": "https://example.com/docs/cap-theorem", "duration": 30, "order": 2},
                {"title": "Designing Idempotent REST & gRPC Endpoints", "type": "video", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 40, "order": 3},
                {"title": "Hands-on Project: Distributed Cache Implementation", "type": "assignment", "url": "https://github.com/example/distributed-cache", "duration": 90, "order": 4},
            ],
        },
        {
            "coach": coaches[1],  # David
            "title": "Practical Deep Learning & LLM Application Engineering",
            "category": "Data Science & AI",
            "level": "Intermediate",
            "duration_hours": 30,
            "price": 199.00,
            "description": "Learn to fine-tune transformers, build RAG (Retrieval-Augmented Generation) systems, and deploy scalable inference APIs with vector databases.",
            "learning_objectives": "Understand transformer attention mechanisms\nBuild semantic search pipelines with vector embeddings\nImplement high-throughput model serving with FastAPI\nEvaluate prompt chains and grounding hallucination prevention",
            "thumbnail_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
            "resources": [
                {"title": "Transformer Architecture from Scratch", "type": "video", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 45, "order": 1},
                {"title": "Vector Embeddings & Similarity Metric Guide", "type": "document", "url": "https://example.com/docs/embeddings", "duration": 20, "order": 2},
                {"title": "Building Production RAG with LangChain & FAISS", "type": "assignment", "url": "https://github.com/example/rag-pipeline", "duration": 60, "order": 3},
            ],
        },
        {
            "coach": coaches[2],  # Elena
            "title": "Full-Stack Web Mastery: React, Django REST & Scalable SQL",
            "category": "Software Engineering",
            "level": "All Levels",
            "duration_hours": 20,
            "price": 120.00,
            "description": "End-to-end curriculum taking you from relational database normalization and REST API modeling to modern reactive frontends with React 19.",
            "learning_objectives": "Model relational schemas with strict integrity constraints\nImplement token-based auth and role-based permissions\nConstruct reusable React components and custom hooks\nHandle real-time state synchronization and optimistic UI updates",
            "thumbnail_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
            "resources": [
                {"title": "Modern RESTful API Principles & Best Practices", "type": "video", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 35, "order": 1},
                {"title": "PostgreSQL Schema Indexing & Query Profiling", "type": "document", "url": "https://example.com/docs/sql-performance", "duration": 25, "order": 2},
                {"title": "Building Dynamic Frontends with React & Hooks", "type": "video", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "duration": 50, "order": 3},
                {"title": "Complete Capstone Project Submission", "type": "assignment", "url": "https://github.com/example/fullstack-capstone", "duration": 120, "order": 4},
            ],
        },
    ]

    created_courses = []
    for cd in courses_seed:
        c, _ = Course.objects.get_or_create(
            title=cd["title"],
            defaults={
                "coach": cd["coach"],
                "category": cd["category"],
                "level": cd["level"],
                "duration_hours": cd["duration_hours"],
                "price": cd["price"],
                "description": cd["description"],
                "learning_objectives": cd["learning_objectives"],
                "thumbnail_url": cd["thumbnail_url"],
                "is_published": True,
            },
        )
        created_courses.append(c)

        for res_data in cd["resources"]:
            LearningResource.objects.get_or_create(
                course=c,
                title=res_data["title"],
                defaults={
                    "resource_type": res_data["type"],
                    "url": res_data["url"],
                    "duration_minutes": res_data["duration"],
                    "order": res_data["order"],
                    "description": f"Core module resource covering {res_data['title']}.",
                },
            )

    # 5. Enrollments & Progress
    # Alex enrolled in Cloud course (50% progress) and Full-Stack course (25%)
    enr1, _ = Enrollment.objects.get_or_create(
        student=students[0],
        course=created_courses[0],
    )
    resources_c0 = list(created_courses[0].resources.all())
    if len(resources_c0) >= 2:
        ResourceProgress.objects.get_or_create(
            enrollment=enr1, resource=resources_c0[0], defaults={"is_completed": True, "completed_at": timezone.now()}
        )
        ResourceProgress.objects.get_or_create(
            enrollment=enr1, resource=resources_c0[1], defaults={"is_completed": True, "completed_at": timezone.now()}
        )
    enr1.recalculate_progress()

    enr2, _ = Enrollment.objects.get_or_create(
        student=students[0],
        course=created_courses[2],
    )
    resources_c2 = list(created_courses[2].resources.all())
    if len(resources_c2) >= 1:
        ResourceProgress.objects.get_or_create(
            enrollment=enr2, resource=resources_c2[0], defaults={"is_completed": True, "completed_at": timezone.now()}
        )
    enr2.recalculate_progress()

    # Priya enrolled in AI course (66% progress)
    enr3, _ = Enrollment.objects.get_or_create(
        student=students[1],
        course=created_courses[1],
    )
    resources_c1 = list(created_courses[1].resources.all())
    if len(resources_c1) >= 2:
        ResourceProgress.objects.get_or_create(
            enrollment=enr3, resource=resources_c1[0], defaults={"is_completed": True, "completed_at": timezone.now()}
        )
        ResourceProgress.objects.get_or_create(
            enrollment=enr3, resource=resources_c1[1], defaults={"is_completed": True, "completed_at": timezone.now()}
        )
    enr3.recalculate_progress()

    # 6. Availability Slots (Today & Upcoming Days)
    today = timezone.now().date()
    times = [
        (datetime.time(10, 0), datetime.time(11, 0)),
        (datetime.time(11, 30), datetime.time(12, 30)),
        (datetime.time(14, 0), datetime.time(15, 0)),
        (datetime.time(16, 0), datetime.time(17, 0)),
    ]

    slots_pool = []
    for coach in coaches:
        for day_offset in range(1, 6):
            slot_date = today + datetime.timedelta(days=day_offset)
            for st, et in times:
                slot, _ = AvailabilitySlot.objects.get_or_create(
                    coach=coach,
                    date=slot_date,
                    start_time=st,
                    defaults={"end_time": et, "is_booked": False},
                )
                slots_pool.append(slot)

    # 7. Bookings
    # Book session 1: Alex with Sarah
    s1 = slots_pool[0]
    s1.is_booked = True
    s1.save()
    b1, _ = Booking.objects.get_or_create(
        student=students[0],
        coach=coaches[0],
        slot=s1,
        defaults={
            "course": created_courses[0],
            "topic": "Microservices Decomposition & Partitioning Strategy",
            "notes": "Need architectural guidance on isolating order and inventory domains with outbox pattern.",
            "meeting_link": "https://meet.jit.si/coachconnect-sarah-alex",
            "status": "confirmed",
        },
    )

    # Book session 2: Priya with David
    s2 = slots_pool[20]
    s2.is_booked = True
    s2.save()
    b2, _ = Booking.objects.get_or_create(
        student=students[1],
        coach=coaches[1],
        slot=s2,
        defaults={
            "course": created_courses[1],
            "topic": "Fine-Tuning Llama Models on Custom Enterprise Data",
            "notes": "Discussing quantization methods (QLoRA) and loss evaluation metrics.",
            "meeting_link": "https://meet.jit.si/coachconnect-david-priya",
            "status": "confirmed",
        },
    )

    # 8. Notifications
    Notification.objects.get_or_create(
        user=students[0],
        title="Session Reminder",
        defaults={
            "message": f"Your 1-on-1 session with Coach Sarah Jenkins is scheduled on {s1.date} at {s1.start_time.strftime('%H:%M')}.",
            "notification_type": "booking_confirmed",
            "link": "/bookings",
        },
    )
    Notification.objects.get_or_create(
        user=coaches[0],
        title="Upcoming Session Scheduled",
        defaults={
            "message": f"Student Alex Rivera has scheduled a session for {s1.date} at {s1.start_time.strftime('%H:%M')}.",
            "notification_type": "booking_created",
            "link": "/bookings",
        },
    )
    Notification.objects.get_or_create(
        user=students[0],
        title="Welcome to CoachConnect!",
        defaults={
            "message": "Explore verified coaches, book 1-on-1 live sessions, and level up your skills.",
            "notification_type": "system",
            "link": "/courses",
        },
    )

    print("[SUCCESS] CoachConnect database seeded successfully!")
    print("\nDemo Accounts:")
    print("  Administrator: admin@coachconnect.io / AdminPass123!")
    print("  Coach (Sarah): sarah.coach@coachconnect.io / CoachPass123!")
    print("  Coach (David): david.coach@coachconnect.io / CoachPass123!")
    print("  Student (Alex): alex.student@coachconnect.io / StudentPass123!")
    print("  Student (Priya): priya.student@coachconnect.io / StudentPass123!")


if __name__ == "__main__":
    seed()
