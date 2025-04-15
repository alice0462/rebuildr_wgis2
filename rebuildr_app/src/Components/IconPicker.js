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

    return (
        <div ref={ref} className="icon-picker">
            <ICON
                onClick={() => {
                    setShowIconListVisibility((showIconList) => !showIconList);
                }}
                {...currentActiveIcon}
            />
            <ICONS_List
                visible={showIconList}
                ICONS={ICONS}
                onIconSelection={onIconSelection}
                loadingId={loadingId}
            />
        </div>
    );
};

export default IconPicker;