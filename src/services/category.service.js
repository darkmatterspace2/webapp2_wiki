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
    }
};

window.CategoryService = CategoryService;
