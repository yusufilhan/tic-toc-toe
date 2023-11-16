import {IConfirmButtons, IConfirmDialog} from "./Types";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography} from "@mui/material";
import {generateUniqueKey} from "../../Utils";
import {create, show, useModal} from "@ebay/nice-modal-react";
import CloseIcon from '@mui/icons-material/Close';

const ConfirmDialog = create(
    ({title, buttons, showCloseButton, content}: IConfirmDialog) => {

      const modal = useModal()

      const handleClose = () => void modal.remove()

      const onButtonClicked = (button: IConfirmButtons) => {
        if (button.callBack)
          button.callBack()
        modal.remove()
      }

      const drawButtons = () => {
        return(
            buttons.map((button)=> {
              return(
                  <Button
                      key={generateUniqueKey()}
                      variant={button.variant ? button.variant : undefined}
                      color={button.color ? button.color : undefined}
                      onClick={()=> onButtonClicked(button)}
                  >
                    <Typography
                        color={button.color === 'inherit' ? 'inherit.text' : undefined}
                        variant={'button'}
                    >
                      {button.label}
                    </Typography>
                  </Button>
              )
            })
        )
      }

      return(
          <Dialog
              open={modal.visible}
              scroll={'body'}
              maxWidth={'sm'}
              fullWidth
              transitionDuration={100}
          >
            <DialogTitle>
              {title}
              {showCloseButton && (
                  <IconButton
                    sx={{
                      color: 'primary.main',
                      float: 'right'
                    }}
                    onClick={handleClose}
                  >
                    <CloseIcon/>
                  </IconButton>
              )}
            </DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions
                sx={{
                  p: '8px 24px 16px 24px'
                }}
            >
              <Stack spacing={2} direction={'row'}>
                {drawButtons()}
              </Stack>

            </DialogActions>
          </Dialog>
      )
    }
)

const showConfirmDialog = ({
  title, showCloseButton, buttons, content
}: IConfirmDialog) => {
  void show(ConfirmDialog, {title, buttons, showCloseButton, content})
}

export default showConfirmDialog