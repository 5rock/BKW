import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="text-lg font-bold text-gray-900 dark:text-white block mb-4">GoldMarket</Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-[200px]">
              The world's most trusted marketplace for gold, jewelry, and luxury investment assets.
            </p>
            <div className="flex gap-3">
              {['public', 'alternate_email', 'language'].map((icon) => (
                <a key={icon} href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-secondary hover:underline decoration-primary-container underline-offset-4 text-sm transition-all duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Services</h4>
            <ul className="space-y-2">
              {['Shipping Info', 'Returns', 'Bulk Orders', 'Gift Cards', 'Help Center'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-secondary hover:underline decoration-primary-container underline-offset-4 text-sm transition-all duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Newsletter</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Get the latest updates on gold rates and luxury trends.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary-container outline-none text-sm dark:text-white"
              />
              <button className="bg-primary-container p-2 rounded-lg hover:bg-primary-fixed-dim transition-colors">
                <span className="material-symbols-outlined text-on-primary-container">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 GoldMarket Global. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-gray-400">payments</span>
            <span className="material-symbols-outlined text-gray-400">lock</span>
            <span className="material-symbols-outlined icon-filled text-gray-400">verified_user</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
