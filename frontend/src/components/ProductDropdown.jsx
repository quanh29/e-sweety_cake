import { useState, useEffect } from 'react';
import dropdownStyles from './ProductDropdown.module.css';
import { formatCurrency } from '../utils/format';

const ProductDropdown = ({ index, selectedProductId, products = [], orderItems = [], onSelect }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleClickOutside = () => setOpen(false);
    if (open) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  const product = products.find(p => p.id === selectedProductId);

  const selectedProductIds = orderItems.map((it, idx) => idx !== index ? it.productId : null).filter(Boolean);
  const availableProducts = products.filter(p => !selectedProductIds.includes(p.id));
  const filtered = availableProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={dropdownStyles.wrapper} onClick={(e) => e.stopPropagation()}>
      <div className={dropdownStyles.control} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); setSearch(''); }}>
        {product ? (
          <>
            <img src={product.image} alt={product.name} className={dropdownStyles.smallImg} />
            <span className={dropdownStyles.name}>{product.name}</span>
          </>
        ) : (
          <span className={dropdownStyles.placeholder}>-- Chọn sản phẩm --</span>
        )}
        <span className={dropdownStyles.chev}>▼</span>
      </div>

      {open && (
        <div className={dropdownStyles.menu} onClick={(e) => e.stopPropagation()}>
          <div className={dropdownStyles.searchWrap}>
            <input className={dropdownStyles.search} placeholder="🔍 Tìm kiếm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          </div>
          {filtered.length === 0 ? (
            <div className={dropdownStyles.empty}>Không tìm thấy sản phẩm</div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className={dropdownStyles.item} onClick={() => { onSelect(p.id); setOpen(false); setSearch(''); }}>
                <img src={p.image} alt={p.name} className={dropdownStyles.img} />
                <div className={dropdownStyles.itemContent}>
                  <div className={dropdownStyles.itemName}>{p.name}</div>
                  <div className={dropdownStyles.itemPrice}>{formatCurrency(p.price)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDropdown;
