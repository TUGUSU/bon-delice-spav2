import React from "react";

/**
 * SkeletonCard – loading placeholder(helps order or something....)
 */
function SkeletonCard() {
  return (
    <div className="skel-card">
      <div className="skel-img skeleton" />
      <div className="skel-body">
        <div className="skel-line md skeleton" />
        <div className="skel-line sm skeleton" />
        <div className="skel-line skeleton" style={{ width: "90%" }} />
      </div>
    </div>
  );
}

export default SkeletonCard;
