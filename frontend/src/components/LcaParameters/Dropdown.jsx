import {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'


function Dropdown({select,setSelected}, options){
    const[isActive, setIsActive] = useState(false);
    const abstractDrivers = ['Delivery Vehicle', 'Packaging', 'Routes', 'Filling Material']
    //const abstractDrivers = options
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
        {abstractDrivers.map((option) => (<div className="dropdown-item"
            onClick={e => {
            setSelected(option)
            setIsActive(false)}
            }>
                {option}
            </div> ))}
        </div>
    )}
   
</div>
);
}
export default Dropdown;