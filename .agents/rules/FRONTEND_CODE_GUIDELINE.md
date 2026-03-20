---
alwaysApply: true
---

# Front-End Code Guideline

## Props As `interface` And Destructure Inside
Component props must be declared as an `interface` placed directly above the component, separated by one blank line. Components take a single `props` parameter and destructure on the first line of the function body.

Do:
```tsx
interface LoginFormProps extends React.ComponentProps<'div'> {}

export function LoginForm(props: LoginFormProps) {
  const { className, ...rest } = props
  return <div className={className} {...rest} />
}
```

Don't:
```tsx
type LoginFormProps = React.ComponentProps<'div'>

export function LoginForm({ className }: LoginFormProps) {
  return <div className={className} />
}
```

## Function Declaration Components Only
Components and functions inside component scope must use function declarations, not arrow functions.

Do:
```tsx
export function LoginForm(props: LoginFormProps) {
  const { className } = props

  function handleSubmit() {}

  return <div className={className} />
}
```

Don't:
```tsx
export const LoginForm = (props: LoginFormProps) => {
  const { className } = props
  const handleSubmit = () => {}
  return <div className={className} />
}
```

## No Inline Event Handlers
Handlers passed to JSX props must be named functions defined in the component scope.

Do:
```tsx
export function LoginForm(props: LoginFormProps) {
  function handleSubmit() {}

  return <form onSubmit={handleSubmit} />
}
```

Don't:
```tsx
export function LoginForm(props: LoginFormProps) {
  return <form onSubmit={(event) => event.preventDefault()} />
}
```

## Function Scope Order
Keep a consistent ordering inside component functions.

Order:
1. Props destructuring.
2. React-native hooks (`useState`, `useReducer`, `useContext`, `useMemo`, `useCallback`, etc.).
3. Custom hooks.
4. Third-party hooks (e.g. `useAtomValue`).
5. Event handlers.
6. Derived `const` values.
7. JSX return.

Do:
```tsx
export function LoginForm(props: LoginFormProps) {
  const { className } = props

  const [count, setCount] = useState(0)

  const { user } = useCurrentUser()

  const formState = useAtomValue(loginAtom)

  function handleSubmit() {}

  const isReady = Boolean(user && formState)

  return <div className={className} />
}
```

## Avoid `useEffect`
`useEffect` is a code smell. Only use it when strictly necessary and document why in the PR or code comment.

Do:
```tsx
export function Status() {
  const [isOnline] = useNetworkStatus()
  return <span>{isOnline ? 'Online' : 'Offline'}</span>
}
```

Don't:
```tsx
export function Status() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true))
  }, [])

  return <span>{isOnline ? 'Online' : 'Offline'}</span>
}
```

## No Context Providers
Do not create Context Providers for shared state. Use Jotai for outer-scope state management and `jotai-immer` for immutability.

Do:
```tsx
const userAtom = atom<User | null>(null)
```

Don't:
```tsx
const UserContext = createContext<User | null>(null)
```

## Immer For State Updates
For component state, use React state APIs with Immer to keep updates immutable.

Do:
```tsx
const [formState, updateFormState] = useImmer<LoginFormState>(loginFormState)
```

Don't:
```tsx
const [formState, setFormState] = useState(loginFormState)
setFormState({ ...formState, email })
```

## Local `lib` Structure Per Route
Each App Router layer (page, sub-page, or parallel route slot) should use a local `lib` folder. Only create subfolders that are needed. Do not add empty placeholders.

Common structure:
- `lib/ui/client`
- `lib/ui/server`
- `lib/ui/actions`
- `lib/ui/validation`

## Client Component Isolation
Interactive components must live under `lib/ui/client` to maximize server component usage and streaming.

## Form Logic Split By Responsibility
Client form logic should be split into dedicated files by responsibility.

Required pattern:
- `form.handlers` for user events
- `form.mappers` for state mutations
- `form.types` for types
- `form.validation` for Zod schema
- `form-state.data` for defaults

## Component State Defaults
Component-level defaults must live in `*-state.data` files and may compose from route-level `state.data`.

Do:
```ts
export const loginFormState: LoginFormState & LoginState = {
  ...loginStateData,
  isPending: false
}
```

## Tailwind Usage Scope
Tailwind utilities are for layout and structure only. For styling beyond layout, prefer utilities or components. Use one-off Tailwind classes only for explicit exceptions.

Do:
```tsx
<div className="flex flex-col gap-6">
  <Card />
</div>
```

Don't:
```tsx
<div className="text-red-500 bg-gradient-to-r from-pink-500 to-yellow-500">
  <Card />
</div>
```
