/**
 * Доступ к контенту сайта.
 *
 * Сайт статический: базы данных нет, все тексты и фотографии лежат в
 * `content/site.ts` и попадают в сборку. Функции оставлены асинхронными,
 * чтобы страницы не зависели от способа хранения контента.
 */
import {
  projects,
  services,
  settings,
  type ProjectItem,
  type ServiceItem,
  type SiteSettings,
} from "@/content/site";

export type { ProjectItem, ServiceItem, SiteSettings };

export async function getSettings(): Promise<SiteSettings> {
  return settings;
}

export async function getServices(): Promise<ServiceItem[]> {
  return [...services].sort((a, b) => a.sort - b.sort);
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getProjects(): Promise<ProjectItem[]> {
  return [...projects].sort((a, b) => a.sort - b.sort);
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  return projects.find((p) => p.slug === slug) ?? null;
}
