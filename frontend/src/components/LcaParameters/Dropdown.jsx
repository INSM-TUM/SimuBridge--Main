import {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'


function Dropdown(){
    const[isActive, setIsActive] = useState(false);
return (
<div className="dropdown">
<div className="dropdown-btn" 
onClick={ e=> setIsActive(!isActive)}
onBlur={() => setIsActive(false)}
tabIndex="0"
>
 Choose One 
 <FontAwesomeIcon icon={faCaretDown} />
</div>
    {isActive && ( 
        <div className="dropdown-content">  
            <div className="dropdown-item">
                React
            </div> 
            <div className="dropdown-item">
                Angular
            </div> 
        </div>
    )}
   
</div>
);
}
export default Dropdown;