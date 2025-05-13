import { useState, useEffect, useRef } from 'react';
import { setIcon } from './utils.js';
import { ICONS } from './Icons.js';
import classNames from 'classnames';


const STANDARD_ICON_ID = 1;

const ICON = ({ id, source, label, locked, onClick, used, category}) => {
  const handleDragStart = (e) => {
    if (locked || category === 'trees') {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData("application/icon-id", id);
};  
const handleClick = () => {
  if (locked) {
    onClick && onClick("You haven't saved enough CO₂ to unlock this icon!");
    return;
  }

  onClick && onClick(id); // Alla upplåsta ikoner kan klickas
};

  
  return (
    <div
      className='icon-wrapper'
      style={{ position: 'relative' }}
      draggable={!locked && !used && category !== 'trees'}
      onDragStart={handleDragStart}
      onClick={handleClick}
  >
            <img src={source} alt={label} className={classNames('icon-img', (locked || used) && 'faded')} />
            {locked && (
                    <img src="/SvgIcons/padlock_9088306.png" className="icon-lock-overlay" />)}
        </div>
    );
};

const IconPicker = ({userId,co2Savings}) => {
    const [selectedIcon, setSelectedIcon] = useState(STANDARD_ICON_ID);
    const [loadingId, setLoadingId] = useState(null);
    const currentActiveIcon = ICONS.find(icon => icon.id === selectedIcon);
    const [showIconList, setShowIconListVisibility] = useState(false);
    const [climateUsers, setClimateUsers] = useState([]);
    const [itemToPlace, setItemToPlace] = useState(null);
    const [placedItems, setPlacedItems] = useState([]);
    const [draggingItemIndex, setDraggingItemIndex] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const treeRef = useRef(null);
    const [toastMessage, setToastMessage] = useState(null);

    
    useEffect(() => {
      if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(null), 2000);
        return () => clearTimeout(timer);
      }
    }, [toastMessage]);
    
    const handleTreeClick = (e) => {
        if (!itemToPlace) return;
      
        const rect = e.currentTarget.getBoundingClientRect();
        
        setItemToPlace(null);
        };

        const handleDrop = (e) => {
          e.preventDefault();
        
          const iconId = e.dataTransfer.getData("application/icon-id");
          const icon = ICONS.find((i) => i.id === parseInt(iconId));
        
          if (!icon || icon.unlockRequirement > co2Saved || icon.category === 'trees') return;
        
          const rect = treeRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - 25;
          const y = e.clientY - rect.top - 25;
        
          const alreadyPlaced = placedItems.some(item => item.id === icon.id);
          if (alreadyPlaced) return;
        
          setPlacedItems(prev => [...prev, { ...icon, x, y, rotation: 0 }]);
        };
        
        
        const handleStartDrag = (e, index) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            setDraggingItemIndex(index);
            document.body.classList.add("grabbing");
          };
        
          useEffect(() => {
            
            
            const move = (e) => {
              if (draggingItemIndex === null || !treeRef.current) return;
          
              const touch = e.touches?.[0] || e; 
              const rect = treeRef.current.getBoundingClientRect();
              const rawX = touch.clientX - rect.left - 20;
              const rawY = touch.clientY - rect.top - 20;

              const maxX = rect.width - 50; 
              const maxY = rect.height - 50;
              const clampedX = Math.max(0, Math.min(rawX, maxX));
              const clampedY = Math.max(0, Math.min(rawY, maxY));
          
              setPlacedItems((prev) =>
                prev.map((item, i) =>
                    i === draggingItemIndex ? { ...item, x: clampedX, y: clampedY } : item
                )
              );
            };
          
            const end = () => {
              if (draggingItemIndex !== null) {
                setDraggingItemIndex(null);
                document.body.classList.remove("grabbing");
              }
            };
          
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", end);
            window.addEventListener("touchmove", move, { passive: false });
            window.addEventListener("touchend", end);
          
            return () => {
              window.removeEventListener("mousemove", move);
              window.removeEventListener("mouseup", end);
              window.removeEventListener("touchmove", move);
              window.removeEventListener("touchend", end);
            };
          }, [draggingItemIndex]);
          
          
          useEffect(() => {
            console.log("Användar-ID från props:", userId);
            console.log("Alla användare:", climateUsers);
            const currentUserTest = climateUsers.find(user => parseInt(user.user_id) === parseInt(userId));
            console.log("Hittad användare:", currentUserTest);
        }, [climateUsers, userId]);
        

    const onClose = () => {
        setShowIconListVisibility(false); 
      };
    const plusButton = () => {
        setShowIconListVisibility(true);
    };

    useEffect(() => {
        fetch('/data/user_db.json')
            .then(response => response.json())
            .then(data => setClimateUsers(data)) 
            .catch(error => console.error('Error fetching user data:', error));
    }, []);
    
    const currentUser = climateUsers.find(user => parseInt(user.user_id) === parseInt(userId));
    const co2Saved = currentUser ? parseFloat(co2Savings[userId].co2_savings) : 0;

    const onIconSelection = async (arg) => {
      if (typeof arg === 'string') {
        setToastMessage(arg); // visa toast om vi får text
        return;
      }
    
      const id = arg;
      const selectedIcon = ICONS.find(icon => icon.id === id);
      if (!selectedIcon) return;
    
      if (selectedIcon.unlockRequirement > co2Saved) {
        setToastMessage("You haven't saved enough CO₂ to unlock this icon!");
        return;
      }
    
      if (selectedIcon.category === 'trees') {
        setLoadingId(id);
        await setIcon(id);             // sparar som huvudträd i backend
        setSelectedIcon(id);           // visar trädet i UI
        setLoadingId(null);
      } 
    };
    
    const categories = [
        { id: 'trees', label: 'Trees' },
        { id: 'fruits', label: 'Fruits' },
        { id: 'animals', label: 'Animals'},
        { id: 'flowers', label: 'Flowers'},
        { id: 'random', label: 'Random'}
      ];
    const [selectedCategory, setSelectedCategory] = useState('trees');
      
    const filteredIcons = ICONS.filter(icon => icon.category === selectedCategory);

    const getRankBanner = () => {
      if (co2Saved < 1122) {
        return <img src="/SvgIcons/BannerBronze.png" alt="Bronze Banner" className="rank-banner-img" />;
      } else if (co2Saved < 2177) {
        return <img src="/SvgIcons/BannerSilver.png" alt="Silver Banner" className="rank-banner-img" />;
      } else {
        return <img src="/SvgIcons/BannerGold.png" alt="Gold Banner" className="rank-banner-img" />;
      }
    };

    const handleIconClick = (index) => {
      setSelectedItemIndex(selectedItemIndex === index ? null : index);
    };

    const handleRotate = (index, direction) => {
      setPlacedItems(prev => prev.map((item, i) => 
        i === index ? { ...item, rotation: (item.rotation + (direction === 'left' ? -45 : 45)) % 360 } : item
      ));
    };

    return (
        <div className="icon-picker">
          <div className="plus-button" onClick={plusButton}>
            <img src="/SvgIcons/Plus.png" alt="Plus" />
          </div>
          <div ref={treeRef} className="main-tree-container" onClick={handleTreeClick} 
            onDragOver={(e) => {e.preventDefault() ; e.dataTransfer.dropEffect = "move";}}onDrop={handleDrop}>
            {loadingId !== null && <div className="loader"></div>}
            <img
                src={currentActiveIcon.source}
                alt="tree"
                className="main-tree-img"
                draggable={false}
            />
            {placedItems.map((item, index) => (
              <div key={index} style={{ position: 'absolute', left: item.x, top: item.y }}>
                <img
                  src={item.source}
                  alt={item.label}
                  className={`placed-icon ${item.category}`}
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                    cursor: 'pointer'
                  }}
                  onMouseDown={(e) => handleStartDrag(e, index)}
                  onTouchStart={(e) => handleStartDrag(e, index)}
                  onClick={() => handleIconClick(index)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setPlacedItems(prev => prev.filter((p, i) => i !== index));
                    setSelectedItemIndex(null);
                  }}
                />
                {selectedItemIndex === index && (
                  <div className="rotation-controls" style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)' }}>
                    <button onClick={() => handleRotate(index, 'left')} className="rotate-btn">↶</button>
                    <button onClick={() => handleRotate(index, 'right')} className="rotate-btn">↷</button>
                  </div>
                )}
              </div>
            ))}
            {toastMessage && (
                <div className="toast">
                    {toastMessage}
                </div>
            )}
            {/* Decorative rank banner under the tree */}
            {getRankBanner()}
          </div>

          <div className={classNames('icons-list', showIconList && 'visible')}>
            <div className="icons-list-header">
                <p>Customize tree by adding icons</p>
                <button className="close-button" onClick={onClose}>×</button>
                <button className="clear-button" onClick={() => setPlacedItems([])}>Clear</button>
            </div>

            <div className="category-tabs">
                {categories.map(cat => (
                <div
                    key={cat.id}
                    className={classNames('tab', cat.id === selectedCategory && 'active')}
                    onClick={() => setSelectedCategory(cat.id)}
                >
                    {cat.label}
                </div>
            ))}
            </div>
        
            <div className="icon-grid">
            {filteredIcons.map((icon) => (
            <ICON
                loading={icon.id === loadingId}
                {...icon}
                key={icon.id}
                locked={icon.unlockRequirement > co2Saved}
                onClick={onIconSelection}
                used={placedItems.some(item => item.id === icon.id)}
            />
            ))} 
            </div>
          </div>
        </div>
        
    );
    
};

export default IconPicker;


