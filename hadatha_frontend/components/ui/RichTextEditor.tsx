"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    Unlink,
    Undo,
    Redo,
    Strikethrough,
    Code,
    Quote,
    Minus,
    Type,
    ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { useCallback, useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    minHeight?: string
    maxHeight?: string
    maxCharacters?: number
    showCharacterCount?: boolean
}

const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
}: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
}) => (
    <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
            "h-8 w-8 p-0 rounded-lg transition-all",
            isActive
                ? "bg-white text-black hover:bg-white hover:text-black shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/10",
            disabled && "opacity-30 cursor-not-allowed"
        )}
    >
        {children}
    </Button>
)

const ToolbarDivider = () => <div className="w-px h-5 bg-white/10 mx-1" />

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Start typing...",
    disabled,
    className,
    minHeight = "150px",
    maxHeight,
    maxCharacters,
    showCharacterCount = false
}: RichTextEditorProps) {
    const [isFocused, setIsFocused] = useState(false)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer transition-colors",
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
            CharacterCount.configure({
                limit: maxCharacters,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editable: !disabled,
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
    })

    const setLink = useCallback(() => {
        if (!editor) return

        const previousUrl = editor.getAttributes("link").href
        const url = window.prompt("Enter URL:", previousUrl)

        if (url === null) return

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
            return
        }

        // Add https:// if no protocol specified
        const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`
        editor.chain().focus().extendMarkRange("link").setLink({ href: formattedUrl }).run()
    }, [editor])

    if (!editor) {
        return null
    }

    const characterCount = editor.storage.characterCount.characters()
    const wordCount = editor.storage.characterCount.words()
    const isLimitReached = maxCharacters && characterCount >= maxCharacters

    return (
        <div className={cn(
            "w-full rounded-2xl border-2 bg-white/5 overflow-hidden transition-all duration-200 h-full",
            isFocused && !disabled ? "border-white/30 ring-4 ring-white/5 shadow-lg" : "border-white/10",
            disabled && "opacity-50 cursor-not-allowed bg-white/2",
            className
        )}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2.5 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                {/* Text Formatting Group */}
                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        disabled={disabled}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        disabled={disabled}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive("strike")}
                        disabled={disabled}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive("code")}
                        disabled={disabled}
                        title="Inline Code"
                    >
                        <Code className="w-4 h-4" />
                    </MenuButton>
                </div>

                <ToolbarDivider />

                {/* Heading Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={disabled}
                            className={cn(
                                "h-8 px-3 rounded-lg transition-all text-xs font-medium gap-1",
                                (editor.isActive("heading") || editor.isActive("paragraph"))
                                    ? "bg-white/10 text-white"
                                    : "text-white/60 hover:text-white hover:bg-white/10"
                            )}
                        >
                            <Type className="w-4 h-4" />
                            {editor.isActive("heading", { level: 1 }) ? "H1" :
                                editor.isActive("heading", { level: 2 }) ? "H2" :
                                    editor.isActive("heading", { level: 3 }) ? "H3" : "P"}
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black border-white/10 text-white min-w-[140px]">
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().setParagraph().run()}
                            className={cn(
                                "cursor-pointer",
                                editor.isActive("paragraph") && "bg-white/10"
                            )}
                        >
                            <span className="text-sm">Paragraph</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={cn(
                                "cursor-pointer",
                                editor.isActive("heading", { level: 1 }) && "bg-white/10"
                            )}
                        >
                            <span className="text-xl font-bold">Heading 1</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={cn(
                                "cursor-pointer",
                                editor.isActive("heading", { level: 2 }) && "bg-white/10"
                            )}
                        >
                            <span className="text-lg font-bold">Heading 2</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={cn(
                                "cursor-pointer",
                                editor.isActive("heading", { level: 3 }) && "bg-white/10"
                            )}
                        >
                            <span className="text-base font-bold">Heading 3</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ToolbarDivider />

                {/* List Group */}
                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        disabled={disabled}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive("orderedList")}
                        disabled={disabled}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive("blockquote")}
                        disabled={disabled}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </MenuButton>
                </div>

                <ToolbarDivider />

                {/* Link Group */}
                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={setLink}
                        isActive={editor.isActive("link")}
                        disabled={disabled}
                        title="Add Link (Ctrl+K)"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        disabled={disabled || !editor.isActive("link")}
                        title="Remove Link"
                    >
                        <Unlink className="w-4 h-4" />
                    </MenuButton>
                </div>

                <ToolbarDivider />

                {/* Other Actions */}
                <MenuButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    disabled={disabled}
                    title="Horizontal Line"
                >
                    <Minus className="w-4 h-4" />
                </MenuButton>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={disabled || !editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={disabled || !editor.can().redo()}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <Redo className="w-4 h-4" />
                    </MenuButton>
                </div>
            </div>

            {/* Editor Content - No inner borders */}
            <div
                className="relative"
                style={{
                    minHeight,
                    maxHeight: maxHeight || 'none',
                    overflowY: maxHeight ? 'auto' : 'visible'
                }}
            >
                <style jsx global>{`
                    .ProseMirror {
                        outline: none !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .ProseMirror:focus {
                        outline: none !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                `}</style>

                <EditorContent
                    editor={editor}
                    className={cn(
                        "prose prose-invert max-w-none p-4",
                        "min-h-[200px]",
                        "focus:outline-none",
                        // Spacing
                        "prose-p:my-2 prose-p:leading-relaxed",
                        "prose-headings:my-3 prose-headings:font-bold",
                        "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
                        "prose-ul:my-2 prose-ul:pl-6",
                        "prose-ol:my-2 prose-ol:pl-6",
                        "prose-li:my-1",
                        // Links
                        "prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors",
                        // Text colors
                        "prose-strong:text-white prose-strong:font-semibold",
                        "prose-headings:text-white",
                        "prose-code:text-purple-300",
                        // Blockquote
                        "prose-blockquote:border-l-2 prose-blockquote:border-white/30 prose-blockquote:pl-4 prose-blockquote:text-white/70 prose-blockquote:italic prose-blockquote:my-3",
                        // Code
                        "prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono",
                        "prose-code:before:content-[''] prose-code:after:content-['']",
                        // HR
                        "prose-hr:border-white/20 prose-hr:my-4",
                        // Placeholder styles - target ProseMirror directly
                        "[&_.ProseMirror.is-editor-empty:before]:content-[attr(data-placeholder)]",
                        "[&_.ProseMirror.is-editor-empty:before]:text-white/30",
                        "[&_.ProseMirror.is-editor-empty:before]:float-left",
                        "[&_.ProseMirror.is-editor-empty:before]:h-0",
                        "[&_.ProseMirror.is-editor-empty:before]:pointer-events-none"
                    )}
                />
            </div>

            {/* Footer with Character Count */}
            {(showCharacterCount || maxCharacters) && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-black/20 text-xs">
                    <div className="text-white/40 font-medium">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </div>
                    {maxCharacters && (
                        <div className={cn(
                            "font-mono font-medium",
                            isLimitReached ? "text-red-400" : "text-white/60"
                        )}>
                            {characterCount} / {maxCharacters}
                        </div>
                    )}
                    {showCharacterCount && !maxCharacters && (
                        <div className="text-white/40 font-mono">
                            {characterCount} characters
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}