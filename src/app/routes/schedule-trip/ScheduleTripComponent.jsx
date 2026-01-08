import React, { useState, useEffect } from 'react';
import '../../../App.css';

export default function ScheduleTripComponent({ state, setState }) {
    const [time, setTime] = useState({
        time: state.time,
        time_type: state.time_type,
    });
    const [isCardBodyOpen, setIsCardBodyOpen] = useState(state.isEditMode || false);

    useEffect(() => {
        if (state.isEditMode || (state.time && state.time !== "")) {
            setIsCardBodyOpen(true);
        }
    }, [state.isEditMode, state.time]);

    useEffect(() => {
        setTime({
            time: state.time,
            time_type: state.time_type,
        });
    }, [state.time, state.time_type]);

    const values_select_time = ["Salir ahora", "Salir a las:", "Llegar a las:"];

    const options = () => {
        return values_select_time.map(value => (
            <option key={`option-${value}`} style={{ fontSize: 9 }} value={value}>{value}</option>
        ));
    }

    const updateTime = (e) => {
        const { id, value } = e.target;

        if (id === 'select-type') {
            const newTimeValue = value === "Salir ahora" ? "" : state.time; 
            
            setTime(prevTime => ({
                ...prevTime,
                time_type: value,
                time: newTimeValue 
            }));
            
            setState(prevState => ({
                ...prevState,
                time_type: value,
                time: newTimeValue 
            }));
        } else if (id === 'select-time') {
            setTime(prevTime => ({
                ...prevTime,
                time: value
            }));
            setState(prevState => ({
                ...prevState,
                time: value
            }));
        }
    }

    return (
        <div className="card mt-2">
            <div className="card-header card-module" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Programa tu viaje</span>
                <button className="btn ml-auto mr-2 custom-btn" style={{ padding: 0 }} onClick={() => setIsCardBodyOpen(!isCardBodyOpen)}>
                    {isCardBodyOpen ? <i className="icon-circle-up"></i> : <i className="icon-circle-down"></i>}
                </button>
            </div>

            {isCardBodyOpen && (
                <div className="card-body" style={{ background: '#E4E4E4', padding: 1 }}>
                    <div className="row mt-2 mb-2">
                        <div className="col-4 pl-4">
                            <select id="select-type" value={time.time_type} style={{ width: '140%', fontSize: 9 }} className='form-control' onChange={updateTime}>
                                {options()}
                            </select>
                        </div>
                        <div className="col-8">
                            <div style={{ display: `${time.time_type === "Salir ahora" ? "none" : "block"}` }}>
                                <input id="select-time" style={{ fontSize: 9 }} value={time.time} onChange={updateTime} className="form-control" type="datetime-local" required />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
