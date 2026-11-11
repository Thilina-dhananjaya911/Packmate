import { PackingTemplate, TemplateItem, TripType } from '../../types';
import { getDatabase } from '../index';

const TEMPLATE_SELECT_WITH_COUNTS = `
  SELECT
    pt.*,
    COUNT(ti.id) AS item_count,
    COALESCE(SUM(CASE WHEN ti.is_essential = 1 THEN 1 ELSE 0 END), 0) AS essential_count
  FROM packing_templates pt
  LEFT JOIN template_items ti ON ti.template_id = pt.id
`;

export async function getAllTemplates(): Promise<PackingTemplate[]> {
  const db = await getDatabase();
  return db.getAllAsync<PackingTemplate>(
    `${TEMPLATE_SELECT_WITH_COUNTS}
     GROUP BY pt.id
     ORDER BY pt.id ASC`
  );
}

export async function getTemplateById(
  templateId: number
): Promise<PackingTemplate | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PackingTemplate>(
    `${TEMPLATE_SELECT_WITH_COUNTS}
     WHERE pt.id = ?
     GROUP BY pt.id`,
    [templateId]
  );
}

export async function getTemplateByTripType(
  tripType: TripType
): Promise<PackingTemplate | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PackingTemplate>(
    `${TEMPLATE_SELECT_WITH_COUNTS}
     WHERE pt.trip_type = ?
     GROUP BY pt.id
     LIMIT 1`,
    [tripType]
  );
}

export async function getTemplateItems(
  templateId: number
): Promise<TemplateItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<TemplateItem>(
    `SELECT
       ti.*,
       ic.name AS category_name,
       ic.color_hex AS category_color,
       ic.icon_name AS category_icon
     FROM template_items ti
     INNER JOIN item_categories ic ON ic.id = ti.category_id
     WHERE ti.template_id = ?
     ORDER BY ic.sort_order ASC, ti.is_essential DESC, ti.item_name ASC`,
    [templateId]
  );
}
