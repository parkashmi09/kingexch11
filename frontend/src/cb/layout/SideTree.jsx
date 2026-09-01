import { useState } from 'react';

/**
 * The sidebar's expanding tree.
 *
 * Markup matches what react-accessible-treeview emits, because the reference
 * builds this with that library and its stylesheet is written against those
 * class names: `tree-branch-wrapper` / `tree-leaf-list-item` on the item,
 * `tree-node__branch` / `tree-node__leaf` on the row, and `tree-node-group` on
 * a nested list. `.tree-node img` is what holds an icon to 32px and
 * `.sidetree ul.sidebartree li div` is what gives a row its 35px height, so
 * these names are load-bearing, not decoration.
 *
 * Only nodes at the top level carry an icon — the same rule the reference
 * applies (`element.parent === 'root'`).
 */
function TreeNode({ node, depth, onSelect }) {
  const [open, setOpen] = useState(false);
  const children = node.children || [];
  const isBranch = children.length > 0;

  const activate = () => {
    if (isBranch) setOpen((v) => !v);
    else if (node.route) onSelect(node);
  };

  return (
    <li className={isBranch ? 'tree-branch-wrapper' : 'tree-leaf-list-item'}>
      <div
        className={`tree-node tree-node__${isBranch ? 'branch' : 'leaf'}`}
        onClick={activate}
      >
        {depth === 0 && node.icon && <img src={node.icon} alt="homeicon" />}
        {isBranch && (
          <span className="treeview-icon">
            <i className={`fa fa-${open ? 'minus' : 'plus'}-square`} aria-hidden="true"></i>
          </span>
        )}
        <span className="innertext">{node.name}</span>
      </div>

      {isBranch && open && (
        <ul className="tree-node-group">
          {children.map((child, i) => (
            <TreeNode
              key={child.id ?? `${child.name}-${i}`}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function SideTree({ nodes, onSelect }) {
  return (
    <div className="sidetree">
      <ul className="tree sidebartree" role="tree">
        {nodes.map((node, i) => (
          <TreeNode
            key={node.id ?? `${node.name}-${i}`}
            node={node}
            depth={0}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

export default SideTree;
