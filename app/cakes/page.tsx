import { getProducts } from "@/lib/products";
import { getCategories as fetchCategories } from "@/lib/categories";
import { ProductCard } from "@/components/product-card";

export const dynamic = 'force-dynamic';

export default async function CakesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const result = await getProducts({
    search: params.q,
    category: params.category,
    sort: params.sort as any,
    page,
    limit: 12
  });

  const categories = await fetchCategories();

  return (
    <div className="catalogue-page">
      <div className="announcement-bar">Free delivery on orders over $100</div>
      <nav className="navbar">
        <a href="/" className="logo">Cake Canada</a>
        <div className="nav-links">
          <a href="/cakes">All Cakes</a>
          <a href="/categories">Categories</a>
        </div>
      </nav>
      
      <header className="page-hero">
        <h1>Every cake, a work of art.</h1>
      </header>

      <main className="shell">
        <form className="search-bar" action="/cakes" method="GET">
          <input type="text" name="q" placeholder="Search cakes..." defaultValue={params.q} />
          {params.category && <input type="hidden" name="category" value={params.category} />}
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          <button type="submit">Search</button>
        </form>

        <div className="catalogue-layout">
          <aside className="catalogue-filters">
            <h3>Filters</h3>
            <div className="filter-group">
              <h4>Categories</h4>
              <ul className="category-list">
                <li><a href="/cakes" className={!params.category ? 'active' : ''}>All</a></li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <a href={`/cakes?category=${cat.slug}${params.sort ? `&sort=${params.sort}` : ''}`} className={params.category === cat.slug ? 'active' : ''}>
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="filter-group">
              <h4>Sort By</h4>
              <ul className="sort-list">
                <li><a href={`/cakes?${params.category ? `category=${params.category}&` : ''}sort=newest`}>Newest</a></li>
                <li><a href={`/cakes?${params.category ? `category=${params.category}&` : ''}sort=price_asc`}>Price: Low to High</a></li>
                <li><a href={`/cakes?${params.category ? `category=${params.category}&` : ''}sort=price_desc`}>Price: High to Low</a></li>
                <li><a href={`/cakes?${params.category ? `category=${params.category}&` : ''}sort=name_asc`}>Name: A to Z</a></li>
              </ul>
            </div>
          </aside>

          <div className="catalogue-content">
            <div className="results-info">
              Showing {result.products.length} of {result.total} cakes
            </div>
            
            {result.products.length === 0 ? (
              <div className="empty-state">No cakes found. Try adjusting your filters.</div>
            ) : (
              <>
                <div className="catalogue-grid">
                  {result.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {result.totalPages > 1 && (
                  <div className="pagination">
                    {page > 1 && (
                      <a href={`/cakes?page=${page - 1}${params.category ? `&category=${params.category}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.q ? `&q=${params.q}` : ''}`}>Prev</a>
                    )}
                    
                    {Array.from({ length: result.totalPages }).map((_, i) => (
                      <a key={i} href={`/cakes?page=${i + 1}${params.category ? `&category=${params.category}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.q ? `&q=${params.q}` : ''}`} className={page === i + 1 ? 'active' : ''}>
                        {i + 1}
                      </a>
                    ))}
                    
                    {page < result.totalPages && (
                      <a href={`/cakes?page=${page + 1}${params.category ? `&category=${params.category}` : ''}${params.sort ? `&sort=${params.sort}` : ''}${params.q ? `&q=${params.q}` : ''}`}>Next</a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Cake Canada. All rights reserved.</p>
      </footer>
    </div>
  );
}
