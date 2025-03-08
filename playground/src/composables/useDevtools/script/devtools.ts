/* eslint-disable antfu/no-top-level-await */
import './keyboardEvent'

interface WidgetHostElement extends HTMLElement {
  __widget: {
    element: HTMLElement
    childrenInternal: any
  }
}

interface ViewManagerWidgetElement extends HTMLElement {
  tabbedPane: {
    delegate: {
      moveToDrawer: (drawer: string) => void
    }
    selectTab: (tab: string, focus: boolean) => void
    focus: () => void
    element: HTMLElement
  }
  drawerTabbedPane: {
    delegate: {
      moveToDrawer: (drawer: string) => void
    }
    selectTab: (tab: string, focus: boolean) => void
    focus: () => void
    element: HTMLElement
  }
  closeDrawer: () => void
}

async function waitForElement(selector: string, container: Element, waitForShadowRoot = false) {
  let el
  while (!el) {
    el = container.querySelector(selector)
    if (!el || (waitForShadowRoot && !el.shadowRoot)) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  return el
}

await waitForElement('.tabbed-pane', document.documentElement)

const viewManager = document.querySelector('.split-widget')! as unknown as WidgetHostElement
const viewManagerWidget = viewManager.__widget!.childrenInternal.at(0) as ViewManagerWidgetElement
const { tabbedPane } = viewManagerWidget

const style = document.createElement('style')
style.id = 'inject-css-tab-pane'
style.textContent = `
  .tabbed-pane-left-toolbar {
    display: none;
  }`
tabbedPane.element.shadowRoot?.append(style)

const tabPaneDelegate = tabbedPane.delegate

tabPaneDelegate.moveToDrawer('elements')
tabPaneDelegate.moveToDrawer('sources')
tabPaneDelegate.moveToDrawer('resources')

setTimeout(() => {
  tabbedPane.focus()
  tabbedPane.selectTab('console', true)

  viewManagerWidget.closeDrawer()
}, 10)
