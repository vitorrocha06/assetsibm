import { useGlobalState } from "../../hooks/globalState";
import PropTypes from "prop-types";
import {
  FaceDissatisfied,
  FaceNeutral,
  FaceSatisfied,
  FaceActivated,
  FaceCool,
} from "@carbon/icons-react";
import Rating from "@mui/material/Rating";
import { createRows } from "../../helpers/misc";

const customIcons = {
  1: {
    icon: <FaceDissatisfied size={24} />,
    label: "Very Dissatisfied",
  },
  2: {
    icon: <FaceNeutral size={24} />,
    label: "Dissatisfied",
  },
  3: {
    icon: <FaceSatisfied size={24} />,
    label: "Neutral",
  },
  4: {
    icon: <FaceActivated size={24} />,
    label: "Satisfied",
  },
  5: {
    icon: <FaceCool size={24} />,
    label: "Very Satisfied",
  },
};

function IconContainer(props) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}

IconContainer.propTypes = {
  value: PropTypes.number.isRequired,
};

export default function BasicRating({ intent, logID, defaultValue }) {
  const { logs, setLogs } = useGlobalState();

  function updateScore(newValue) {
    logs[intent].map((log) => {
      if (log.LOGID === logID) {
        log.SCORE = newValue;
        setLogs(logs);
      }
    });
  }

  return (
    <Rating
      name="highlight-selected-only"
      defaultValue={defaultValue}
      IconContainerComponent={IconContainer}
      highlightSelectedOnly
      sx={{
        "& .MuiRating-iconFilled": {
          color: "#0E61FE",
        },
        "& .MuiRating-iconEmpty": {
          color: "#b5b5b5",
        },
      }}
      onChange={(e, newValue) => {
        updateScore(newValue);
      }}
    />
  );
}
