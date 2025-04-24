import { useState, useEffect } from 'react';
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
                    <img src="/SvgIcons/padlock-lock.svg" className="icon-lock-overlay" />)}
            
        </div>
    );
};

const IconPicker = ({userId}) => {
    const [selectedIcon, setSelectedIcon] = useState(STANDARD_ICON_ID);
    const [loadingId, setLoadingId] = useState(null);
    const currentActiveIcon = ICONS.find((icon) => icon.id === selectedIcon);
    const [showIconList, setShowIconListVisibility] = useState(false);
    const [climateUsers, setClimateUsers] = useState([]);

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
            
            <div className="main-tree-container">
            {loadingId !== null && <div className="loader"></div>}
            <ICON    
                onClick={() => {
                    setShowIconListVisibility((showIconList) => !showIconList);
                }}
                {...currentActiveIcon}
                loading={false}
            />
            </div>


            <div className={classNames('icons-list', showIconList && 'visible')}>
            <button className="close-button" onClick={onClose}>×</button>

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