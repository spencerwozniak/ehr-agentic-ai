import React from 'react';
import SortableTable from '@/components/SortableTable';

// A comprehensive MDX components mapping for ReactMarkdown or MDXProvider (FULL DISPLAY)
export const mdxComponents = {
  // Headings
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl font-extrabold my-6" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-2xl font-bold my-5" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl font-semibold my-4" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-xl font-semibold my-3" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-lg font-medium my-2" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-md font-medium my-1" {...props}>
      {children}
    </h6>
  ),

  // Paragraph
  p: ({ children, ...props }) => (
    <p className="text-base !font-normal dark:text-white mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),

  // Inline text styles
  strong: ({ children, ...props }) => (
    <strong className="font-bold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  del: ({ children, ...props }) => (
    <del className="line-through text-red-500" {...props}>
      {children}
    </del>
  ),
  inlineCode: ({ children, ...props }) => (
    <code className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  br: (props) => <br {...props} />,

  // Lists
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside mb-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside mb-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1 ml-4" {...props}>
      {children}
    </li>
  ),

  // Blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4" {...props}>
      {children}
    </blockquote>
  ),

  // Thematic break
  hr: (props) => <hr className="my-6 border-gray-700" {...props} />,

  // Links and images
  a: ({ href, children, ...props }) => (
    <a
      className="text-blue-400 underline hover:text-blue-600"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    <img className="max-w-full h-auto my-4 rounded" src={src} alt={alt} {...props} />
  ),

  // Code blocks
  code: ({ className, children, ...props }) => (
    <code className={`${className || ''} bg-gray-900 p-1 rounded font-mono text-sm`} {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre className="bg-gray-900 p-4 rounded overflow-auto my-4" {...props}>
      {children}
    </pre>
  ),

  // Tables
  table: (props) => <SortableTable {...props} />,

  // Other
  mark: ({ children, ...props }) => (
    <mark className="bg-yellow-500 text-black" {...props}>
      {children}
    </mark>
  ),
  sub: ({ children, ...props }) => <sub {...props}>{children}</sub>,
  sup: ({ children, ...props }) => <sup {...props}>{children}</sup>,

  // Fallback: render any other tags as-is
  // eslint-disable-next-line react/display-name
  wrapper: ({ children }) => <>{children}</>
};

// TYPING
export const mdxComponentsTyping = {
  // Headings
  h1: ({ children, ...props }) => (
    <h1 className="text-5xl font-extrabold my-6" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-4xl font-bold my-5" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-3xl font-semibold my-4" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-2xl font-semibold my-3" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="text-xl font-medium my-2" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="text-lg font-medium my-1" {...props}>
      {children}
    </h6>
  ),

  // Paragraph
  p: ({ children, ...props }) => (
    <p className="text-base !font-normal dark:text-white mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),

  // Inline text styles
  strong: ({ children, ...props }) => (
    <strong className="font-bold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  del: ({ children, ...props }) => (
    <del className="line-through text-red-500" {...props}>
      {children}
    </del>
  ),
  inlineCode: ({ children, ...props }) => (
    <code className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  br: (props) => <br {...props} />,

  // Lists
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside mb-4" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside mb-4" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1 ml-4" {...props}>
      {children}
    </li>
  ),

  // Blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4" {...props}>
      {children}
    </blockquote>
  ),

  // Thematic break
  hr: (props) => <hr className="my-6 border-gray-700" {...props} />,

  // Links and images
  a: ({ href, children, ...props }) => (
    <a
      className="text-blue-400 underline hover:text-blue-600"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }) => (
    <img className="max-w-full h-auto my-4 rounded" src={src} alt={alt} {...props} />
  ),

  // Code blocks
  code: ({ className, children, ...props }) => (
    <code className={`${className || ''} bg-gray-900 p-1 rounded font-mono text-sm`} {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }) => (
    <pre className="bg-gray-900 p-4 rounded overflow-auto my-4" {...props}>
      {children}
    </pre>
  ),

  // Tables
  // Add this *inside* your mdxComponents mapping (replace the table entry):

table: ({ children }) => {
  // Extract thead and tbody, then render just like your SortableTable (but stateless)
  const thead = React.Children.toArray(children).find(
    (child) => child?.type?.displayName === 'thead' || child?.type === 'thead'
  );
  const tbody = React.Children.toArray(children).find(
    (child) => child?.type?.displayName === 'tbody' || child?.type === 'tbody'
  );

  const headers = React.Children.toArray(thead?.props.children || []);
  const rows = React.Children.toArray(tbody?.props.children || []);

  return (
    <table className="w-fit min-w-[--thread-content-width] table-auto border-collapse">
      <thead className="font-bold">
        <tr className="border-b border-gray-500">
          {headers[0] &&
            React.Children.map(
              headers[0].props.children,
              (th, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold text-sm border-b border-gray-500"
                >
                  {th.props.children}
                </th>
              )
            )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
            {React.Children.map(row.props.children, (td) => (
              <td className="px-3 py-2 text-sm">{td.props.children}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
},


  // Other
  mark: ({ children, ...props }) => (
    <mark className="bg-yellow-500 text-black" {...props}>
      {children}
    </mark>
  ),
  sub: ({ children, ...props }) => <sub {...props}>{children}</sub>,
  sup: ({ children, ...props }) => <sup {...props}>{children}</sup>,

  // Fallback: render any other tags as-is
  // eslint-disable-next-line react/display-name
  wrapper: ({ children }) => <>{children}</>
};
