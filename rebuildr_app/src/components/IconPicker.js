import { useState, useEffect, useRef } from 'react';
import { setIcon } from './utils.js';
import { ICONS } from './Icons.js';
import classNames from 'classnames';
import useClickOutside from './ClickOutside.js';

const STANDARD_ICON_ID = 1;


const ICON = ({ id, source, label, onClick, locked}) => {
    return (
        <div className='icon-wrapper' style={{ position: 'relative' }} onClick={() => !locked && onClick(id)}>
            <img src={source} alt={label} className={classNames('icon-img', locked && 'faded')} />
            {locked && (
                    <img src="/SvgIcons/padlock_9088306.png" className="icon-lock-overlay" />)}
        </div>
    );
};

const IconPicker = ({userId}) => {
    const [selectedIcon, setSelectedIcon] = useState(STANDARD_ICON_ID);
    const [loadingId, setLoadingId] = useState(null);
    const currentActiveIcon = ICONS.find((icon) => icon.id === selectedIcon);
    const [showIconList, setShowIconListVisibility] = useState(false);
    const [climateUsers, setClimateUsers] = useState([]);
    const [itemToPlace, setItemToPlace] = useState(null);
    const [placedItems, setPlacedItems] = useState([]);
    const [draggingItemIndex, setDraggingItemIndex] = useState(null);
    const treeRef = useRef(null);

    
    const handleTreeClick = (e) => {
        if (!itemToPlace) return;
        
        const alreadyPlaced = placedItems.some(item => item.id === itemToPlace.id);
        if (alreadyPlaced) return;
      
        const rect = e.currentTarget.getBoundingClientRect();
        const sizeMap = {
            fruits: 20,
            random: 100,
            animals: 50,
            flowers: 50,
          };
        
        const iconSize = sizeMap[itemToPlace.category] || 30;
        
        const x = e.clientX - rect.left - iconSize / 2;
        const y = e.clientY - rect.top - iconSize / 2;
        
        setPlacedItems([...placedItems, { ...itemToPlace, x, y }]);
        setItemToPlace(null);
        };
        
        const handleStartDrag = (e, index) => {
            e.preventDefault(); // Stoppar t.ex. scroll på mobil
            setDraggingItemIndex(index);
            document.body.classList.add("grabbing");
          };
        
          useEffect(() => {
            const move = (e) => {
              if (draggingItemIndex === null || !treeRef.current) return;
          
              const touch = e.touches?.[0] || e; // För både touch och mus
              const rect = treeRef.current.getBoundingClientRect();
              const rawX = touch.clientX - rect.left - 20;
              const rawY = touch.clientY - rect.top - 20;

              const maxX = rect.width - 50; // ikonens bredd
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
          
          
          

    const ref = useClickOutside(() => setShowIconListVisibility(false));

    const onClose = () => {
        setShowIconListVisibility(false); 
      };
    const plusButton = () => {
        setShowIconListVisibility(true);
    };

    useEffect(() => {
        fetch('/data/userData.json')
            .then(response => response.json())
            .then(data => setClimateUsers(data))
            .catch(error => console.error('Error fetching user data:', error));
    }, []);

    const currentUser = climateUsers.find(user => user.id === userId);
    const co2Saved = currentUser ? parseInt(currentUser.totalCo2Saved) : 0;

    const onIconSelection = async (id) => {

        const selectedIcon = ICONS.find(icon => icon.id === id);
        if (selectedIcon.unlockRequirement > co2Saved) {
            alert("You haven't saved enough CO2 to unlock this icon!");
            return;
        }
        if (selectedIcon.category !== 'trees') {
            setItemToPlace(selectedIcon); // sätter objektet i placeringsläge
            return;
          }
          

        setLoadingId(id);
        await setIcon(id);
        setSelectedIcon(id);
        setLoadingId(null);

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

    return (
        <div ref={ref} className="icon-picker">
            <div className="plus-button" onClick={plusButton}>+</div>
            
            <div ref={treeRef} className="main-tree-container" onClick={handleTreeClick}>
                {loadingId !== null && <div className="loader"></div>}
                <img
                    src={currentActiveIcon.source}
                    alt="tree"
                    className="main-tree-img"/>
                {placedItems.map((item, index) => (
    
                 <img
                    key={index}
                    src={item.source}
                    alt={item.label}
                    className={`placed-icon ${item.category}`}
                    style={{
                        left: item.x,
                        top: item.y,
                        }}
                        onMouseDown={(e) => handleStartDrag(e, index)}
                        onTouchStart={(e) => handleStartDrag(e, index)}

                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            
                            setPlacedItems(prev =>
                            prev.filter((p, i) => i !== index)
                        );
                }}
                />
   
  ))}
</div>



            <div className={classNames('icons-list', showIconList && 'visible')}>
            <div className="icons-list-header">
                <button className="close-button" onClick={onClose}>×</button>
                <button className="clear-button" onClick={() => setPlacedItems([])}>Clean</button>
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
                onClick={onIconSelection}
                {...icon}
                key={icon.id}
                locked={icon.unlockRequirement > co2Saved}

            />
            ))}
            
            </div>
        </div>
        </div>
        
    );
};

export default IconPicker;