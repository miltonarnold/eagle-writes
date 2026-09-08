export default async function handler(req, res) {
    try {
        const SUPABASE_URL =
            'https://ekkvghdnejvyjykagafr.supabase.co';

        const SUPABASE_KEY =
            'sb_publishable_Ih6_PG5YhHoW9zhlhZddsg_Z9zwrn1h';

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/articles?select=slug,updated_at,created_at&status=eq.approved&order=created_at.desc`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Supabase request failed: ${response.status}`
            );
        }

        const articles = await response.json();

        const staticPages = [
            'https://eagle-writes.vercel.app/',
            'https://eagle-writes.vercel.app/about.html',
            'https://eagle-writes.vercel.app/services.html',
            'https://eagle-writes.vercel.app/courses.html',
            'https://eagle-writes.vercel.app/contact.html',
            'https://eagle-writes.vercel.app/get-started.html',
            'https://eagle-writes.vercel.app/articles.html'
        ];

        const staticUrls = staticPages.map(url => `
    <url>
        <loc>${url}</loc>
    </url>`).join('');

        const articleUrls = articles.map(article => {
            const lastModified =
                article.updated_at ||
                article.created_at;

            return `
    <url>
        <loc>https://eagle-writes.vercel.app/article.html?slug=${encodeURIComponent(article.slug)}</loc>
        <lastmod>${new Date(lastModified).toISOString()}</lastmod>
    </url>`;
        }).join('');

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleUrls}
</urlset>`;

        res.setHeader(
            'Content-Type',
            'application/xml; charset=utf-8'
        );

        res.setHeader(
            'Cache-Control',
            'public, s-maxage=300, stale-while-revalidate=600'
        );

        return res.status(200).send(sitemap);

    } catch (error) {
        console.error('Sitemap generation error:', error);

        return res.status(500).json({
            error: 'Unable to generate sitemap'
        });
    }
}