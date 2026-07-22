import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name = 'BKW E-Commerce', type = 'website', image = '', url = '' }) => {
  return (
    <Helmet>
      { /* Standard metadata tags */ }
      <title>{title ? `${title} | ${name}` : name}</title>
      <meta name='description' content={description} />
      
      { /* Facebook / Open Graph tags */ }
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title ? `${title} | ${name}` : name} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      
      { /* Twitter tags */ }
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title ? `${title} | ${name}` : name} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
