const Products = {
	state: {
		storeUrl: 'https://api-demo-store.myshopify.com/api/2022-01/graphql.json',
		contentType: 'application/graphql',
		accept: 'application/json',
		accessToken: 'b8385e410d5a37c05eead6c96e30ccb8'
	},

	/**
	 * Sets up the query string for the GraphQL request
	 * @param {number} no Number of items to withdraw
	 * @returns {String} A GraphQL query string
	 */
	query: no => `
  {
    products(first: ${no}){
      edges {
          node {
            id
            title
            tags
            featuredImage{
              url
            }
            priceRange{
              maxVariantPrice{
                amount
                currencyCode
              }
              minVariantPrice{
                amount
                currencyCode
              }
            }
          }
        }
    }
  }
  `,

	/**
	 * Format returned product JSON
	 * @param {object} productsResponseJson Raw data returned from API
	 * @returns {object} Formatted Data
	 */
	formatted: productsResponseJson => {
		const products = productsResponseJson.data.products.edges;
		return products.map(({ node: productNode }) => ({
			id: productNode.id,
			title: productNode.title,
			leadingTag: productNode.tags[0],
			price: CURRENCY_SYMBOLS[productNode.priceRange.minVariantPrice.currencyCode] + productNode.priceRange.minVariantPrice.amount,
			image: productNode.featuredImage.url
		}));
	},

	/**
	 * Fetches the products via GraphQL then runs the display function
	 */
	handleFetch: async () => {
		const productsResponse = await fetch(Products.state.storeUrl, {
			method: 'POST',
			headers: {
				'Content-Type': Products.state.contentType,
				Accept: Products.state.accept,
				'X-Shopify-Storefront-Access-Token': Products.state.accessToken
			},
			body: Products.query(3)
		});
		const productsResponseJson = await productsResponse.json();
		Products.displayProducts(Products.formatted(productsResponseJson));
	},

	/**
	 * Takes a JSON representation of the products and renders cards to the DOM
	 * @param {Object} productsJson
	 */
	displayProducts: productsJson => {
		let products = '';
		productsJson.forEach(product => {
			products += Templates.product(product);
		});
		document.querySelector('#products').innerHTML = products;
	},

	/**
	 * Setup listener for fetch button. On click, send a request to the API to retrieve the product data.
	 */
	initialize: () => {
		document.querySelector('#fetchButton').addEventListener('click', () => {
			Products.handleFetch();
			document.querySelector('#empty').innerHTML = Templates.spinner;
		});
	}
};

/**
 * Initialize products actions
 */
document.addEventListener('DOMContentLoaded', () => {
	Products.initialize();
});

/**
 * HTML Templates
 */
const Templates = {
	// Product widget
	product: product => `
    <div class="product">
      <div class="tag">${product.leadingTag}</div>
      <div class="image"><img src="${product.image}"/></div>
      <div class="title">${product.title}</div>
      <b>${product.price}</b>
      <button><span> SHOP NOW</span> <img src="arrow.svg"/></button>
    </div>
  `,

	// Loading Spinner
	spinner: '<span id="spinner"> </span>'
};

/**
 * SYMBOLS
 */
const CURRENCY_SYMBOLS = { USD: '$' };
