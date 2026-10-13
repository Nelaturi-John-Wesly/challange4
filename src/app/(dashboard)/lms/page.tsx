import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  Download,
  FileCheck,
  FileText,
  FolderOpen,
  Plus,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LMSPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resolvedParams = await searchParams;
  const courseFilter = resolvedParams?.course;

  // Fetch all CSE Sem 5 Courses
  const courses = await prisma.course.findMany({
    where: { semester: 5 },
    include: {
      materials: {
        include: {
          faculty: { include: { user: true } },
        },
        orderBy: { uploadedAt: "desc" },
      },
    },
    orderBy: { code: "asc" },
  });

  const selectedCourse = courseFilter
    ? courses.find((c) => c.code === courseFilter) || courses[0]
    : courses[0];

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Learning Management System (LMS)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official academic repository for syllabus outlines, color-annotated lecture slides, and question banks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/lms/assignments">
            <Button variant="outline" size="sm" className="gap-2">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Go to Assignments Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        {courses.map((c) => {
          const isSelected = selectedCourse?.id === c.id;
          return (
            <Link key={c.id} href={`/lms?course=${c.code}`}>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <span>{c.code}</span>
                <span className="hidden md:inline font-normal opacity-80">
                  ({c.name})
                </span>
                <Badge
                  variant={isSelected ? "warning" : "default"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {c.materials.length}
                </Badge>
              </button>
            </Link>
          );
        })}
      </div>

      {/* Selected Course Header Banner */}
      {selectedCourse && (
        <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Badge variant="outline" className="text-amber-400 border-amber-500/40 mb-2">
                {selectedCourse.code} · {selectedCourse.credits} Credits
              </Badge>
              <h3 className="text-xl font-extrabold text-white">
                {selectedCourse.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Semester 5 Core Module · Computer Science & Engineering
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FolderOpen className="w-4 h-4 text-amber-500" />
              <span>{selectedCourse.materials.length} Published Materials</span>
            </div>
          </div>
        </Card>
      )}

      {/* Materials List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Uploaded Course Materials & Lecture Notes</span>
        </h3>

        {selectedCourse?.materials.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 text-sm">
            No materials uploaded for this subject yet.
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {selectedCourse?.materials.map((item) => (
              <Card
                key={item.id}
                className="p-5 flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-2xs space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="info" className="uppercase text-[10px] font-mono">
                      {item.fileType}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(item.uploadedAt)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    <span>{item.faculty.user.name}</span>
                  </div>

                  <a
                    href={item.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
