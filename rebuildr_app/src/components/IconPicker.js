import { useState } from 'react';
import { setIcon } from './utils.js';
import { ICONS } from './Icons.js';
import classNames from 'classnames';
import useClickOutside from './ClickOutside.js';

const STANDARD_ICON_ID = 2;


const ICON = ({ id, source, label, onClick, loading }) => {
    return (
        <div className="Icon" onClick={() => onClick(id)}>
            <img src={source} alt={label} id="tree" />
            {loading && <div className="loader"></div>}
        </div>
    );
};

const ICONS_List = ({ onIconSelection, ICONS, visible, loadingId }) => {
    return (
        <div className={classNames('icons-list', visible && 'visible')}>
            {ICONS.map((icon) => (
                <ICON
                    loading={icon.id === loadingId}
                    onClick={onIconSelection}
                    {...icon}
                    key={icon.id}
                />
            ))}
        </div>
    );
};

const IconPicker = () => {
    const [selectedIcon, setSelectedIcon] = useState(STANDARD_ICON_ID);
    const [loadingId, setLoadingId] = useState(null);
    const currentActiveIcon = ICONS.find((icon) => icon.id === selectedIcon);
    const [showIconList, setShowIconListVisibility] = useState(false);

    const ref = useClickOutside(() => setShowIconListVisibility(false));

    const onIconSelection = async (id) => {
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
        
            <ICON
                onClick={() => {
                    setShowIconListVisibility((showIconList) => !showIconList);
                }}
                {...currentActiveIcon}
            />

            <div className={classNames('icons-list', showIconList && 'visible')}>

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
            />
            ))}
            
            </div>
        </div>
        </div>
        
    );
};

export default IconPicker;