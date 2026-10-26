// CATEGORY SERVICE
// Centralized category-related queries

const CategoryService = {

    // GET: All unique categories
    async getAll(showRRated = false) {
        const sbClient = AppUtils.initSupabase();
        let query = sbClient.from('wiki_articles').select('category');

        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data) return [];

        // Extract unique categories, filter nulls, sort alphabetically
        return [...new Set(data.map(item => item.category))]
            .filter(Boolean)
            .sort();
    },

    // GET: Categories with article counts
    async getCategoriesWithCounts(showRRated = false) {
        const sbClient = AppUtils.initSupabase();
        let query = sbClient.from('wiki_articles').select('category');

        if (!showRRated) {
            query = query.not("ratings", "in", '("M","P","X")');
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!data) return [];

        const counts = {};
        data.forEach(item => {
            if (item.category) {
                counts[item.category] = (counts[item.category] || 0) + 1;
            }
        });

        return Object.keys(counts)
            .sort()
            .map(cat => ({ category: cat, count: counts[cat] }));
    }
};

window.CategoryService = CategoryService;
