import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../pages/components/ui/card";
import { ContentCard } from "../pages/components/ui/content-card";
import {
  dashboardStats,
  projectsData,
  blogPostsData,
} from "../pages/components/lib/mock-data";
import {
  BarChart3,
  FileText,
  Link as LinkIcon,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminLayout } from "./components/layouts/AdminLayout";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Portfolio Admin</h1>
        <p className="text-muted-foreground">
          Manage your portfolio content with ease
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={dashboardStats.totalProjects}
          icon={<Briefcase className="h-5 w-5 text-muted-foreground" />}
          description="Projects created"
        />
        <StatCard
          title="Blog Posts"
          value={dashboardStats.totalPosts}
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          description="Published articles"
        />
        <StatCard
          title="Social Links"
          value={dashboardStats.totalLinks}
          icon={<LinkIcon className="h-5 w-5 text-muted-foreground" />}
          description="Connected profiles"
        />
        <StatCard
          title="Portfolio Views"
          value={dashboardStats.recentViews}
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
          description="Last 30 days"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <ContentCard title="Recent Projects" description="Your latest projects">
          <div className="space-y-4">
            {projectsData.slice(0, 2).map((project) => (
              <div
                key={project.id}
                className="flex items-start gap-4 border p-3 rounded-md"
              >
                <div
                  className="w-16 h-16 rounded-md bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${project.imageUrl})` }}
                />
                <div>
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>

        <ContentCard
          title="Recent Blog Posts"
          description="Your latest articles"
        >
          <div className="space-y-4">
            {blogPostsData.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-4 border p-3 rounded-md"
              >
                <div
                  className="w-16 h-16 rounded-md bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${post.coverImage})` }}
                />
                <div>
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      <ContentCard title="Activity Overview">
        <div className="h-[200px] flex items-center justify-center">
          <BarChart3 className="h-24 w-24 text-muted-foreground/50" />
          <p className="text-muted-foreground ml-4">
            Activity data visualization coming soon
          </p>
        </div>
      </ContentCard>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  description?: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Dashboard;

Dashboard.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
