import { MetadataRoute } from "next";
import {
  getAllUtilities,
  getAllCategories,
  getAllWidgets,
  getAllWidgetCategories,
} from "@/lib/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://utl.tools";
  const utilities = getAllUtilities();
  const categories = getAllCategories();
  const widgets = getAllWidgets();
  const widgetCategories = getAllWidgetCategories();

  const toolEntries: MetadataRoute.Sitemap = utilities.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: tool.badge === "Popular" ? 0.9 : 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const widgetCategoryEntries: MetadataRoute.Sitemap = widgetCategories.map((wcat) => ({
    url: `${baseUrl}/widgets/${wcat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const widgetItemEntries: MetadataRoute.Sitemap = widgets.map((w) => ({
    url: `${baseUrl}/widgets/item/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/saved`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/widgets`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...categoryEntries,
    ...widgetCategoryEntries,
    ...widgetItemEntries,
    ...toolEntries,
  ];
}
