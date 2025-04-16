import { useEffect, useRef, useCallback} from 'react';


const useClickOutside = (callback) => {

    const ref = useRef(null);

    const handleClick = useCallback( 
        (event) => {

            const isCallbackValid = callback && typeof callback === "function";

            if(!isCallbackValid) {
                return;
            }

            if(ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }, 
            [callback]
    );

    useEffect(() => {
        document.addEventListener('click', handleClick, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, [])
    

    return ref
};

export default useClickOutside;